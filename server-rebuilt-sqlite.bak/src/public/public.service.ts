import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { SettingsService } from '../common/settings.service'
import { CONTENT_TYPES, serializeListing, TYPE_LABELS } from '../common/listing.serializer'
import { parseJsonArray, randomToken, relativeTime, requireFields, toJsonString, toPage } from '../common/utils'

export const DEMO_USER_ID = 'demo-user'

const CATEGORY_META: Record<string, { label: string; icon: string; desc: string }> = {
  jobs: { label: '招聘', icon: 'lucide:job-tie', desc: '全职兼职临时工' },
  houses: { label: '房源', icon: 'lucide:house-market', desc: '出租出售转让' },
  convenience: { label: '便民', icon: 'lucide:hand-heart', desc: '拼车求助打听' },
  yellowPages: { label: '服务', icon: 'lucide:service-paint', desc: '本地商家服务' },
  secondhand: { label: '二手', icon: 'lucide:secondhand-clothes', desc: '闲置转让自提' },
  news: { label: '资讯', icon: 'lucide:newspaper', desc: '本地新鲜事' }
}

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService
  ) {}

  private async currentUser() {
    const user = await this.prisma.user.findUnique({ where: { id: DEMO_USER_ID } })
    if (user) return user
    return this.prisma.user.create({
      data: { id: DEMO_USER_ID, nickname: '青柠用户', phone: '13800000000', status: 'active' }
    })
  }

  private async expireTops() {
    await this.prisma.listing.updateMany({
      where: { isTop: true, topExpireAt: { lt: new Date() } },
      data: { isTop: false, topPriority: 0 }
    })
  }

  private async favoriteIdSet(listingIds: string[]) {
    if (!listingIds.length) return new Set<string>()
    const rows = await this.prisma.favorite.findMany({
      where: { userId: DEMO_USER_ID, listingId: { in: listingIds } },
      select: { listingId: true }
    })
    return new Set(rows.map((row) => row.listingId))
  }

  private async serializeMany(listings: any[]) {
    const favorites = await this.favoriteIdSet(listings.map((item) => item.id))
    return listings.map((item) => serializeListing(item, { forUser: true, isFavorite: favorites.has(item.id) }))
  }

  async home() {
    await this.currentUser()
    await this.expireTops()
    const now = new Date()
    const [settings, homePositions, featured, news] = await Promise.all([
      this.settings.getAll(),
      this.prisma.adPosition.findMany({ where: { scene: 'home' }, include: { ads: { orderBy: { createdAt: 'asc' } } } }),
      this.prisma.listing.findMany({
        where: { status: 'approved', isRecommended: true, type: { not: 'news' } },
        orderBy: [{ isTop: 'desc' }, { topPriority: 'desc' }, { createdAt: 'desc' }],
        take: 6
      }),
      this.prisma.listing.findMany({ where: { status: 'approved', type: 'news' }, orderBy: { createdAt: 'desc' }, take: 5 })
    ])

    const banners = homePositions
      .flatMap((position) => position.ads)
      .filter((ad) => ad.status === 'enabled')
      .filter((ad) => (!ad.startAt || ad.startAt <= now) && (!ad.endAt || ad.endAt >= now))
      .map((ad) => ({
        id: ad.id,
        key: ad.id,
        title: ad.title,
        desc: ad.desc || '',
        type: ad.linkType === 'category' && CONTENT_TYPES.includes(ad.linkValue) ? ad.linkValue : 'jobs',
        image: ad.image || ''
      }))

    return {
      banners,
      categories: await this.categories(),
      featured: await this.serializeMany(featured),
      news: await this.serializeMany(news),
      settings: { city: settings.city || '本地', appName: settings.appName }
    }
  }

  async categories() {
    const rows = await this.prisma.category.findMany({
      where: { status: 'enabled' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    })
    const grouped = new Map<string, string[]>()
    for (const row of rows) {
      grouped.set(row.group, [...(grouped.get(row.group) || []), row.name])
    }
    // 注意：用户端分类页会自行在 tabs 前补「全部」，这里不要包含
    return CONTENT_TYPES.map((type) => ({
      type,
      ...CATEGORY_META[type],
      tabs: grouped.get(type) || []
    }))
  }

  async listings(query: Record<string, unknown>) {
    await this.expireTops()
    const { page, pageSize, skip, take } = toPage(query, 20)
    const where: Record<string, unknown> = { status: 'approved' }
    const type = String(query.type || '')
    if (type) where.type = type
    const tag = String(query.tag || '')
    if (tag && tag !== '全部') where.tag = tag
    const keyword = String(query.keyword || '').trim()
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { summary: { contains: keyword } },
        { address: { contains: keyword } },
        { tag: { contains: keyword } },
        { company: { contains: keyword } }
      ]
    }

    const [total, rows] = await Promise.all([
      this.prisma.listing.count({ where: where as any }),
      this.prisma.listing.findMany({
        where: where as any,
        orderBy: [{ isTop: 'desc' }, { topPriority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take
      })
    ])

    return { items: await this.serializeMany(rows), total, page, pageSize }
  }

  async detail(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { _count: { select: { applications: true, favorites: true } } }
    })
    if (!listing || !['approved', 'offline'].includes(listing.status)) {
      throw new NotFoundException('信息不存在或尚未通过审核')
    }
    if (listing.status === 'offline') throw new NotFoundException('该信息已下架')

    const user = await this.currentUser()
    await Promise.all([
      this.prisma.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } }),
      this.prisma.viewRecord.upsert({
        where: { userId_listingId: { userId: user.id, listingId: id } },
        update: { updatedAt: new Date() },
        create: { userId: user.id, listingId: id }
      })
    ])

    const favorites = await this.favoriteIdSet([id])
    return serializeListing(
      { ...listing, viewCount: listing.viewCount + 1 },
      {
        forUser: true,
        isFavorite: favorites.has(id),
        applicantCount: listing._count.applications,
        favoriteCount: listing._count.favorites
      }
    )
  }

  async preview(id: string, token: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } })
    if (!listing) throw new NotFoundException('信息不存在')
    if (!token || listing.previewToken !== token) throw new BadRequestException('预览链接无效或已过期')
    return serializeListing(listing, { forUser: true })
  }

  async createListing(body: Record<string, unknown>) {
    requireFields(body, ['type', 'title', 'phone'])
    const type = String(body.type)
    if (!CONTENT_TYPES.includes(type)) throw new BadRequestException(`不支持的信息类型：${type}`)
    if (type === 'news') throw new BadRequestException('本地资讯仅支持管理员在后台发布')

    const user = await this.currentUser()
    if (user.status !== 'active') throw new BadRequestException('账号已被限制发布，请联系平台客服')

    const settings = await this.settings.getAll()
    const text = `${body.title || ''} ${body.summary || ''}`
    const words = await this.prisma.sensitiveWord.findMany({ where: { status: 'enabled' } })
    const hits = words.filter((item) => item.word && text.includes(item.word))
    if (hits.length) {
      await this.prisma.sensitiveWord.updateMany({
        where: { id: { in: hits.map((item) => item.id) } },
        data: { hitCount: { increment: 1 } }
      })
      if (settings.sensitiveStrategy === 'reject') {
        throw new BadRequestException(`内容包含敏感词：${hits.map((item) => item.word).join('、')}，请修改后重新提交`)
      }
    }

    const auditTypes = Array.isArray(settings.auditRequiredTypes) ? (settings.auditRequiredTypes as string[]) : []
    const needAudit = hits.length > 0 || auditTypes.includes(type)
    const status = needAudit ? 'pending' : 'approved'

    const listing = await this.prisma.listing.create({
      data: {
        type,
        tag: String(body.tag || ''),
        title: String(body.title),
        price: String(body.price || ''),
        address: String(body.address || ''),
        contact: String(body.contact || user.nickname),
        phone: String(body.phone),
        publisher: user.nickname,
        company: String(body.company || ''),
        ownerType: String(body.ownerType || '个人'),
        status,
        summary: String(body.summary || ''),
        highlights: toJsonString(body.highlights, '[]'),
        images: toJsonString(body.images, '[]'),
        details: toJsonString(body.details, '{}'),
        previewToken: randomToken(),
        userId: user.id
      }
    })

    await this.prisma.message.create({
      data: {
        userId: user.id,
        title: status === 'pending' ? '发布成功，等待审核' : '发布成功',
        desc:
          status === 'pending'
            ? `您发布的「${listing.title}」已提交，审核通过后将自动展示。`
            : `您发布的「${listing.title}」已上线展示。`
      }
    })

    return { ...(serializeListing(listing, { forUser: true }) as Record<string, unknown>), previewToken: listing.previewToken }
  }

  async profile() {
    const user = await this.currentUser()
    const [publishCount, favoriteCount, viewCount] = await Promise.all([
      this.prisma.listing.count({ where: { userId: user.id, status: { not: 'deleted' } } }),
      this.prisma.favorite.count({ where: { userId: user.id } }),
      this.prisma.viewRecord.count({ where: { userId: user.id } })
    ])
    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status
      },
      stats: [
        { label: '发布', value: publishCount, type: 'publications' },
        { label: '收藏', value: favoriteCount, type: 'favorites' },
        { label: '浏览', value: viewCount, type: 'views' }
      ]
    }
  }

  async publications() {
    const user = await this.currentUser()
    const rows = await this.prisma.listing.findMany({
      where: { userId: user.id, status: { not: 'deleted' } },
      orderBy: { createdAt: 'desc' }
    })
    const serialized = await this.serializeMany(rows)
    return serialized.map((item: any, index) => ({ ...item, previewToken: rows[index].previewToken }))
  }

  async favorites() {
    const user = await this.currentUser()
    const rows = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: { listing: true },
      orderBy: { createdAt: 'desc' }
    })
    return rows
      .map((row) => row.listing)
      .filter((listing) => listing && listing.status === 'approved')
      .map((listing) => serializeListing(listing, { forUser: true, isFavorite: true }))
  }

  async views() {
    const user = await this.currentUser()
    const rows = await this.prisma.viewRecord.findMany({
      where: { userId: user.id },
      include: { listing: true },
      orderBy: { updatedAt: 'desc' },
      take: 50
    })
    const listings = rows.map((row) => row.listing).filter((listing) => listing && listing.status === 'approved')
    return this.serializeMany(listings)
  }

  async applications() {
    const user = await this.currentUser()
    const rows = await this.prisma.application.findMany({
      where: { userId: user.id },
      include: { listing: true },
      orderBy: { createdAt: 'desc' }
    })
    const listings = rows.map((row) => row.listing).filter(Boolean)
    return this.serializeMany(listings)
  }

  async reports() {
    const user = await this.currentUser()
    const rows = await this.prisma.report.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return rows.map((row) => ({
      id: row.id,
      targetId: row.targetId,
      targetTitle: row.targetTitle,
      reason: row.reason,
      status: row.status,
      result: row.result,
      createdAt: row.createdAt.toISOString()
    }))
  }

  async toggleFavorite(listingId: string) {
    const user = await this.currentUser()
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) throw new NotFoundException('信息不存在')

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } }
    })
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } })
    } else {
      await this.prisma.favorite.create({ data: { userId: user.id, listingId } })
    }
    const count = await this.prisma.favorite.count({ where: { listingId } })
    return { favorited: !existing, count }
  }

  async apply(listingId: string) {
    const user = await this.currentUser()
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) throw new NotFoundException('职位不存在')
    if (listing.type !== 'jobs') throw new BadRequestException('该信息不支持投递')

    const existing = await this.prisma.application.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } }
    })
    if (existing) throw new BadRequestException('您已投递过该职位，请耐心等待联系')

    await this.prisma.application.create({ data: { userId: user.id, listingId } })
    if (listing.userId && listing.userId !== user.id) {
      await this.prisma.message.create({
        data: {
          userId: listing.userId,
          title: '收到新的职位投递',
          desc: `用户「${user.nickname}」投递了您发布的「${listing.title}」，请尽快联系。`
        }
      })
    }
    const count = await this.prisma.application.count({ where: { listingId } })
    return { applied: true, applicantCount: count }
  }

  async messages() {
    const user = await this.currentUser()
    const rows = await this.prisma.message.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 })
    const result = rows.map((row) => ({
      id: row.id,
      title: row.title,
      desc: row.desc,
      time: relativeTime(row.createdAt),
      unread: row.unread
    }))
    await this.prisma.message.updateMany({ where: { userId: user.id, unread: true }, data: { unread: false } })
    return result
  }

  async createReport(body: Record<string, unknown>) {
    requireFields(body, ['reason'])
    const user = await this.currentUser()
    let targetTitle = String(body.targetTitle || '')
    const targetId = String(body.targetId || '')
    if (targetId && !targetTitle) {
      const listing = await this.prisma.listing.findUnique({ where: { id: targetId } })
      targetTitle = listing ? listing.title : ''
    }
    const report = await this.prisma.report.create({
      data: {
        targetId,
        targetTitle: targetTitle || '平台反馈',
        reason: String(body.reason),
        reporter: user.nickname,
        userId: user.id
      }
    })
    return {
      id: report.id,
      targetId: report.targetId,
      targetTitle: report.targetTitle,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString()
    }
  }
}
