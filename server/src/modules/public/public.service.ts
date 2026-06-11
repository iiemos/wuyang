import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { publicStatuses, serviceCategories } from '../../shared/business'
import { getPagination, pageResult } from '../../shared/pagination'
import { parseBody } from '../../shared/validation'
import { PrismaService } from '../prisma/prisma.service'

const createListingSchema = z.object({
  type: z.enum(['jobs', 'houses', 'convenience', 'yellowPages', 'secondhand']),
  title: z.string().min(2).max(128),
  tag: z.string().min(1).max(32).default('全部'),
  price: z.string().max(64).optional(),
  address: z.string().max(160).optional(),
  contact: z.string().min(1).max(64),
  phone: z.string().min(6).max(32),
  summary: z.string().max(5000).optional(),
  highlights: z.array(z.string().max(20)).max(6).optional(),
  images: z.array(z.string().max(255)).max(14).optional(),
  details: z.record(z.unknown()).optional().nullable()
})
const reportSchema = z.object({
  targetId: z.string().optional(),
  targetTitle: z.string().max(128).optional(),
  reason: z.string().min(2).max(255)
})

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  health() {
    return { ok: true, service: 'qingning-server' }
  }

  async categories() {
    const [counts, categories] = await Promise.all([
      this.categoryCounts(),
      this.prisma.resourceCategory.findMany({ where: { status: 'enabled' }, orderBy: { createdAt: 'asc' } })
    ])
    return serviceCategories.map((item) => ({
      ...item,
      count: counts[item.type] || 0,
      tabs: categories.filter((category) => category.group === item.type).map((category) => category.name)
    }))
  }

  async home() {
    const user = await this.currentUser()
    const [featured, news, settings, ads, counts] = await Promise.all([
      this.homeFeatured(user.id),
      this.prisma.contentItem.findMany({
        where: { type: 'news', status: { in: publicStatuses } },
        include: this.contentInclude(user.id),
        orderBy: [{ isTop: 'desc' }, { createdAt: 'desc' }],
        take: 3
      }),
      this.getPlatformSettings(),
      this.homeAds(),
      this.categoryCounts()
    ])

    return {
      banners: ads.length ? ads : [
        { title: '本周热门岗位', desc: '附近岗位每日更新，电话直连', type: 'jobs' },
        { title: '清爽找房季', desc: '整租合租商铺转让一屏看全', type: 'houses' }
      ],
      categories: serviceCategories.map((item) => ({ ...item, count: counts[item.type] || 0 })),
      featured: featured.map((item) => this.serializeContent(item)),
      news: news.map((item) => this.serializeContent(item)),
      settings: {
        appName: settings.appName || '青柠本地生活',
        city: settings.city || '舞阳',
        customerServicePhone: settings.customerServicePhone || ''
      }
    }
  }

  async listings(query: Record<string, unknown>) {
    const user = await this.currentUser()
    const { page, pageSize, skip, take } = getPagination(query)
    const type = query.type ? String(query.type) : undefined
    const tag = query.tag ? String(query.tag) : undefined
    const keyword = query.keyword ? String(query.keyword) : undefined
    const where = {
      status: { in: publicStatuses },
      ...(type ? { type } : {}),
      ...(tag ? { tag } : {}),
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword } },
              { tag: { contains: keyword } },
              { summary: { contains: keyword } },
              { address: { contains: keyword } },
              { contact: { contains: keyword } }
            ]
          }
        : {})
    }
    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({
        where,
        include: this.contentInclude(user.id),
        skip,
        take,
        orderBy: [{ isTop: 'desc' }, { topPriority: 'desc' }, { createdAt: 'desc' }]
      }),
      this.prisma.contentItem.count({ where })
    ])

    return pageResult(items.map((item) => this.serializeContent(item)), total, page, pageSize)
  }

  async listing(id: string) {
    const user = await this.currentUser()
    const item = await this.prisma.contentItem.findFirst({
      where: { id, status: { in: publicStatuses } },
      include: this.contentInclude(user.id)
    })
    if (!item) throw new NotFoundException('信息不存在或已下架')
    await this.recordBrowse(user.id, item.id)
    return this.serializeContent(item)
  }

  async listingPreview(id: string, token: string | undefined) {
    if (!this.verifyPreviewToken(id, token)) throw new NotFoundException('信息不存在或已下架')
    const user = await this.currentUser()
    const item = await this.prisma.contentItem.findFirst({
      where: { id, status: { not: 'deleted' } },
      include: this.contentInclude(user.id)
    })
    if (!item) throw new NotFoundException('信息不存在或已下架')
    return this.serializeContent(item)
  }

  async createListing(body: unknown) {
    const data = parseBody(createListingSchema, body)
    // 无登录态下信息归属当前体验用户，否则「我的发布」无法关联到刚发布的内容
    const user = await this.currentUser()
    const blocked = await this.hasSensitiveWord(`${data.title} ${data.summary || ''}`)
    const { images, highlights, details, ...content } = data
    const item = await this.prisma.contentItem.create({
      data: {
        ...content,
        ...(details ? { details: details as Prisma.InputJsonObject } : {}),
        tag: data.tag || '全部',
        publisher: user.nickname,
        status: blocked ? 'rejected' : 'pending',
        rejectReason: blocked ? '包含敏感词' : null,
        imageItems: {
          create: (images || []).map((url, index) => ({ url, sortOrder: index }))
        },
        highlightItems: {
          create: (highlights || ['新发布', '待审核']).map((text, index) => ({ text, sortOrder: index }))
        }
      },
      include: this.contentInclude(user.id)
    })
    await this.syncUserCounters(user.id)
    await this.operationLog('用户发布信息', item.title)
    return {
      ...this.serializeContent(item),
      previewToken: this.createPreviewToken(item.id)
    }
  }

  async messages() {
    const items = await this.prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      desc: item.body,
      unread: item.unread,
      time: this.relativeTime(item.createdAt)
    }))
  }

  async profile() {
    const user = await this.currentUser()
    const stats = await this.profileStats(user)
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        publishCount: stats.publish,
        favoriteCount: stats.favorite,
        viewCount: stats.view
      }
    })
    return {
      user: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        phone: updatedUser.phone,
        status: updatedUser.status,
        publishCount: updatedUser.publishCount,
        favoriteCount: updatedUser.favoriteCount,
        viewCount: updatedUser.viewCount,
        registeredAt: updatedUser.registeredAt
      },
      stats: [
        { label: '发布', value: stats.publish, type: 'publications' },
        { label: '收藏', value: stats.favorite, type: 'favorites' },
        { label: '浏览', value: stats.view, type: 'views' }
      ]
    }
  }

  async profilePublications() {
    const user = await this.currentUser()
    const items = await this.prisma.contentItem.findMany({
      where: this.userContentWhere(user),
      include: this.contentInclude(user.id),
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    return items.map((item) => ({
      ...this.serializeContent(item),
      previewToken: item.status === 'approved' ? undefined : this.createPreviewToken(item.id)
    }))
  }

  async profileFavorites() {
    const user = await this.currentUser()
    const rows = await this.prisma.userFavorite.findMany({
      where: { userId: user.id, content: { status: { in: publicStatuses } } },
      include: { content: { include: this.contentInclude(user.id) } },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    return rows.map((row) => this.serializeContent(row.content))
  }

  async profileViews() {
    const user = await this.currentUser()
    const rows = await this.prisma.userBrowseHistory.findMany({
      where: { userId: user.id, content: { status: { in: publicStatuses } } },
      include: { content: { include: this.contentInclude(user.id) } },
      orderBy: { viewedAt: 'desc' },
      take: 100
    })
    return rows.map((row) => ({
      ...this.serializeContent(row.content),
      viewedAt: row.viewedAt,
      viewCount: row.viewCount
    }))
  }

  async profileApplications() {
    const user = await this.currentUser()
    const rows = await this.prisma.jobApplication.findMany({
      where: { userId: user.id },
      include: { content: { include: this.contentInclude(user.id) } },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    return rows.map((row) => ({
      ...this.serializeContent(row.content),
      applyStatus: row.status,
      appliedAt: row.createdAt,
      // 投递的职位若未上架（待审/下架），详情页需走预览通道，否则 404
      previewToken: row.content.status === 'approved' ? undefined : this.createPreviewToken(row.content.id)
    }))
  }

  async profileReports() {
    const user = await this.currentUser()
    return this.prisma.report.findMany({
      where: { reporter: user.nickname },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  }

  async toggleFavorite(id: string) {
    const user = await this.currentUser()
    const item = await this.prisma.contentItem.findFirst({ where: { id, status: { in: publicStatuses } } })
    if (!item) throw new NotFoundException('信息不存在或已下架')
    const exists = await this.prisma.userFavorite.findUnique({
      where: { userId_contentId: { userId: user.id, contentId: id } }
    })
    if (exists) {
      await this.prisma.userFavorite.delete({ where: { id: exists.id } })
      await this.syncUserCounters(user.id)
      return { favorited: false }
    }
    await this.prisma.userFavorite.create({ data: { userId: user.id, contentId: id } })
    await this.syncUserCounters(user.id)
    return { favorited: true }
  }

  async applyJob(id: string) {
    const user = await this.currentUser()
    const item = await this.prisma.contentItem.findFirst({ where: { id, type: 'jobs', status: { in: publicStatuses } } })
    if (!item) throw new NotFoundException('岗位不存在或已下架')
    const row = await this.prisma.jobApplication.upsert({
      where: { userId_contentId: { userId: user.id, contentId: id } },
      update: { status: 'submitted' },
      create: { userId: user.id, contentId: id }
    })
    return row
  }

  async createReport(body: unknown) {
    const user = await this.currentUser()
    const data = parseBody(reportSchema, body)
    const item = data.targetId
      ? await this.prisma.contentItem.findUnique({ where: { id: data.targetId } })
      : null
    return this.prisma.report.create({
      data: {
        targetId: item?.id || data.targetId || 'general',
        targetTitle: item?.title || data.targetTitle || '用户反馈',
        reason: data.reason,
        reporter: user.nickname
      }
    })
  }

  private async getPlatformSettings() {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { id: 'platform' },
      include: { auditTypes: true }
    })
    if (!setting) return {}
    return {
      appName: setting.appName,
      logo: setting.logo,
      city: setting.city,
      customerServicePhone: setting.customerServicePhone,
      customerWechat: setting.customerWechat,
      customerQq: setting.customerQq,
      sensitiveStrategy: setting.sensitiveStrategy,
      newUserPublishDelayHours: setting.newUserPublishDelayHours,
      userAgreement: setting.userAgreement,
      privacyPolicy: setting.privacyPolicy,
      aboutUs: setting.aboutUs,
      auditRequiredTypes: setting.auditTypes.map((item) => item.type)
    }
  }

  private async homeAds() {
    const now = new Date()
    const position = await this.prisma.adPosition.findFirst({
      where: { scene: 'home' },
      include: {
        ads: {
          where: {
            status: 'enabled',
            OR: [{ startAt: null }, { startAt: { lte: now } }],
            AND: [{ OR: [{ endAt: null }, { endAt: { gte: now } }] }]
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })
    return (position?.ads || []).map((ad) => ({
      id: ad.id,
      title: ad.title,
      desc: position?.name || '本地精选推荐',
      image: ad.image,
      type: ad.linkType === 'category' ? ad.linkValue : 'jobs',
      linkType: ad.linkType,
      linkValue: ad.linkValue
    }))
  }

  private async homeFeatured(userId: string) {
    const recommended = await this.prisma.contentItem.findMany({
      where: { status: { in: publicStatuses }, type: { not: 'news' }, isRecommended: true },
      include: this.contentInclude(userId),
      orderBy: [{ isTop: 'desc' }, { topPriority: 'desc' }, { createdAt: 'desc' }],
      take: 6
    })
    if (recommended.length >= 6) return recommended
    const fallback = await this.prisma.contentItem.findMany({
      where: {
        status: { in: publicStatuses },
        type: { not: 'news' },
        id: { notIn: recommended.map((item) => item.id) }
      },
      include: this.contentInclude(userId),
      orderBy: [{ isTop: 'desc' }, { topPriority: 'desc' }, { createdAt: 'desc' }],
      take: 6 - recommended.length
    })
    return [...recommended, ...fallback]
  }

  private async categoryCounts() {
    const rows = await this.prisma.contentItem.groupBy({
      by: ['type'],
      where: { status: { in: publicStatuses } },
      _count: { _all: true }
    })
    return rows.reduce<Record<string, number>>((result, row) => {
      result[row.type] = row._count._all
      return result
    }, {})
  }

  private async hasSensitiveWord(text: string) {
    const words = await this.prisma.sensitiveWord.findMany({ where: { status: 'enabled' } })
    const hit = words.find((item) => text.includes(item.word))
    if (!hit) return false
    await this.prisma.sensitiveWord.update({
      where: { id: hit.id },
      data: { hitCount: { increment: 1 } }
    })
    return true
  }

  private serializeContent(item: any) {
    const details = item.details && typeof item.details === 'object' && !Array.isArray(item.details) ? item.details : {}
    const relationHighlights = Array.isArray(item.highlightItems)
      ? item.highlightItems.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((entry: any) => entry.text)
      : []
    const relationImages = Array.isArray(item.imageItems)
      ? item.imageItems.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((entry: any) => entry.url)
      : []
    const counts = item._count || {}
    return {
      ...details,
      ...item,
      details,
      status: item.status === 'approved' ? 'published' : item.status,
      time: this.relativeTime(item.createdAt),
      highlights: relationHighlights.length ? relationHighlights : Array.isArray(item.highlights) ? item.highlights : [],
      images: relationImages.length ? relationImages : Array.isArray(item.images) ? item.images : [],
      isFavorite: Array.isArray(item.favorites) ? item.favorites.length > 0 : false,
      // 真实互动计数：报名数（招聘详情）、想要/收藏数（二手卡片）
      applicantCount: counts.applications ?? 0,
      favoriteCount: counts.favorites ?? 0,
      wantCount: counts.favorites ?? 0,
      imageItems: undefined,
      highlightItems: undefined,
      favorites: undefined,
      _count: undefined
    }
  }

  private contentInclude(userId?: string) {
    return {
      imageItems: { orderBy: { sortOrder: 'asc' as const } },
      highlightItems: { orderBy: { sortOrder: 'asc' as const } },
      _count: { select: { favorites: true, applications: true } },
      ...(userId ? { favorites: { where: { userId } } } : {})
    }
  }

  private async currentUser() {
    const user = await this.prisma.user.findFirst({
      where: { username: null },
      orderBy: { createdAt: 'asc' }
    })
    if (!user) throw new BadRequestException('用户数据未初始化')
    return user
  }

  private async upsertPublicUser(nickname: string, phone: string) {
    return this.prisma.user.upsert({
      where: { phone },
      update: { nickname },
      create: { nickname, phone }
    })
  }

  private userContentWhere(user: { nickname: string; phone?: string | null }) {
    return {
      status: { not: 'deleted' },
      OR: [
        ...(user.phone ? [{ phone: user.phone }] : []),
        { publisher: user.nickname },
        { contact: user.nickname }
      ]
    }
  }

  private async profileStats(user: { id: string; nickname: string; phone?: string | null }) {
    const [publish, favorite, viewAgg] = await Promise.all([
      this.prisma.contentItem.count({ where: this.userContentWhere(user) }),
      this.prisma.userFavorite.count({ where: { userId: user.id } }),
      this.prisma.userBrowseHistory.aggregate({ where: { userId: user.id }, _sum: { viewCount: true } })
    ])
    return { publish, favorite, view: viewAgg._sum.viewCount || 0 }
  }

  private async syncUserCounters(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return
    const stats = await this.profileStats(user)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        publishCount: stats.publish,
        favoriteCount: stats.favorite,
        viewCount: stats.view
      }
    })
  }

  private async recordBrowse(userId: string, contentId: string) {
    await this.prisma.userBrowseHistory.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: {
        viewCount: { increment: 1 },
        viewedAt: new Date()
      },
      create: { userId, contentId }
    })
    await this.syncUserCounters(userId)
  }

  private createPreviewToken(id: string) {
    const payload = Buffer.from(JSON.stringify({ id, iat: Date.now() }), 'utf8').toString('base64url')
    return `${payload}.${this.previewSignature(payload)}`
  }

  private verifyPreviewToken(id: string, token?: string) {
    if (!token) return false
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return false
    const expected = this.previewSignature(payload)
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)
    if (signatureBuffer.length !== expectedBuffer.length) return false
    try {
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
      return data?.id === id && timingSafeEqual(signatureBuffer, expectedBuffer)
    } catch {
      return false
    }
  }

  private previewSignature(payload: string) {
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_SECRET'))
      .update(payload)
      .digest('base64url')
  }

  private relativeTime(date: Date) {
    const seconds = Math.max(Math.floor((Date.now() - date.getTime()) / 1000), 0)
    if (seconds < 60) return '刚刚'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`
    if (seconds < 172800) return '昨天'
    return `${Math.floor(seconds / 86400)}天前`
  }

  private async operationLog(action: string, target: string) {
    await this.prisma.operationLog.create({
      data: {
        operator: '用户端',
        action,
        target
      }
    })
  }
}
