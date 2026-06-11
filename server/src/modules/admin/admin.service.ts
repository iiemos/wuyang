import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { contentResourceMap, serviceCategories } from '../../shared/business'
import { getPagination, pageResult } from '../../shared/pagination'
import { parseBody } from '../../shared/validation'
import { PrismaService } from '../prisma/prisma.service'

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'offline', 'active', 'banned', 'handled', 'deleted', 'sold', 'solved']),
  rejectReason: z.string().optional(),
  offlineReason: z.string().optional()
})
const topSchema = z.object({
  isTop: z.boolean(),
  topPriority: z.coerce.number().int().min(0).default(0),
  // 取消置顶时前端会传 topExpireAt: null，必须允许 null
  topExpireAt: z.string().optional().nullable()
})
const recommendSchema = z.object({ isRecommended: z.boolean() })
const articleSchema = z.object({
  title: z.string().min(2).max(128),
  tag: z.string().min(1).max(32).default('公告'),
  price: z.string().max(64).optional(),
  address: z.string().max(160).optional(),
  contact: z.string().max(64).optional(),
  phone: z.string().max(32).optional(),
  publisher: z.string().max(64).optional(),
  status: statusSchema.shape.status.optional(),
  summary: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional(),
  images: z.array(z.string().max(255)).max(14).optional(),
  details: z.record(z.unknown()).optional().nullable(),
  isTop: z.boolean().optional(),
  isRecommended: z.boolean().optional()
})
const categorySchema = z.object({
  group: z.string().min(1).max(32).default('secondhand'),
  name: z.string().min(1).max(64),
  status: z.string().default('enabled')
})
const roleSchema = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(64),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional()
})
const contentSchema = z.object({
  title: z.string().min(2).max(128).optional(),
  tag: z.string().min(1).max(32).optional(),
  price: z.string().max(64).optional(),
  address: z.string().max(160).optional(),
  contact: z.string().max(64).optional(),
  phone: z.string().max(32).optional(),
  publisher: z.string().max(64).optional(),
  status: statusSchema.shape.status.optional(),
  rejectReason: z.string().optional().nullable(),
  offlineReason: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional(),
  images: z.array(z.string().max(255)).max(14).optional(),
  details: z.record(z.unknown()).optional().nullable(),
  isTop: z.boolean().optional(),
  topPriority: z.coerce.number().int().min(0).optional(),
  topExpireAt: z.string().optional().nullable(),
  isRecommended: z.boolean().optional(),
  company: z.string().max(96).optional().nullable(),
  ownerType: z.string().max(32).optional().nullable(),
  licenseNo: z.string().max(96).optional().nullable(),
  packageName: z.string().max(64).optional().nullable(),
  packageExpireAt: z.string().optional().nullable()
})
const batchIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, '请选择需要操作的数据')
})
const adminAccountSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(6).max(64).optional(),
  nickname: z.string().min(1).max(64),
  phone: z.string().max(32).optional().nullable(),
  email: z.string().email().optional().nullable(),
  status: z.enum(['active', 'banned']).default('active'),
  roleIds: z.array(z.string()).optional()
})
const adPositionSchema = z.object({
  name: z.string().min(1).max(96),
  scene: z.string().min(1).max(64),
  pv: z.coerce.number().int().min(0).optional(),
  uv: z.coerce.number().int().min(0).optional(),
  ctr: z.string().max(16).optional()
})
const adSchema = z.object({
  title: z.string().min(1).max(128).optional(),
  image: z.string().max(255).optional().nullable(),
  linkType: z.string().max(32).optional(),
  linkValue: z.string().max(128).optional(),
  status: z.string().max(32).optional(),
  startAt: z.string().optional().nullable(),
  endAt: z.string().optional().nullable()
})
const noticeSchema = z.object({
  title: z.string().min(1).max(128),
  content: z.string().max(5000).default(''),
  status: z.enum(['enabled', 'disabled']).default('enabled')
})
const menuSchema = z.object({
  parentId: z.string().optional().nullable(),
  title: z.string().min(1).max(64),
  path: z.string().min(1).max(160),
  component: z.string().max(160).optional().nullable(),
  icon: z.string().max(64).optional().nullable(),
  permission: z.string().max(96).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(['enabled', 'disabled']).default('enabled')
})

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [stats, userStats, audits, publication, reports, certifications, recentOperations] = await Promise.all([
      this.dashboardCards(),
      this.userDataStats(),
      this.audits(),
      this.publicationStats(),
      this.prisma.report.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' }, take: 8 }),
      this.prisma.certification.findMany({ where: { status: 'pending' }, orderBy: { submittedAt: 'desc' }, take: 8 }),
      this.prisma.operationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 })
    ])
    return { stats, userStats, audits, publication, reports, certifications, recentOperations }
  }

  async audits() {
    const items = await this.prisma.contentItem.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return items.map((item) => ({
      id: `audit-${item.id}`,
      targetId: item.id,
      type: item.type,
      title: item.title,
      publisher: item.publisher || item.contact,
      phone: item.phone,
      status: item.status,
      time: this.relativeTime(item.createdAt)
    }))
  }

  async dashboard() {
    return {
      cards: await this.dashboardCards(),
      publication: await this.publicationStats()
    }
  }

  async publicationStats() {
    const grouped = await this.prisma.contentItem.groupBy({
      by: ['type', 'status'],
      _count: { _all: true }
    })
    return serviceCategories.map((category) => {
      const rows = grouped.filter((item) => item.type === category.type)
      const total = rows.reduce((sum, item) => sum + item._count._all, 0)
      const approved = rows.find((item) => item.status === 'approved')?._count._all || 0
      return {
        type: category.type,
        label: category.label,
        total,
        pending: rows.find((item) => item.status === 'pending')?._count._all || 0,
        approved,
        passRate: total ? Math.round((approved / total) * 100) : 0
      }
    })
  }

  async userActivityStats() {
    const [activeUsers, newUsers, loginLogs] = await Promise.all([
      this.prisma.user.count({ where: { status: 'active' } }),
      this.prisma.user.count({ where: { registeredAt: { gte: this.daysAgo(7) } } }),
      this.prisma.loginLog.findMany({ where: { createdAt: { gte: this.daysAgo(1) }, status: 'success' } })
    ])
    const hourly = Array.from({ length: 24 }, (_, hour) => loginLogs.filter((item) => item.createdAt.getHours() === hour).length)
    return { activeUsers, newUsers, retentionRate: 0, hourly }
  }

  async operationStats() {
    const [pendingAudits, pendingReports, shops, adPositions] = await Promise.all([
      this.prisma.contentItem.count({ where: { status: 'pending' } }),
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.contentItem.count({ where: { type: 'yellowPages', status: 'approved' } }),
      this.prisma.adPosition.findMany()
    ])
    return { pendingAudits, pendingReports, adCtr: adPositions[0]?.ctr || '0%', shopGrowth: shops }
  }

  async revenueStats() {
    const paid = await this.prisma.topOrder.findMany({ where: { status: 'paid' } })
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = this.daysAgo(6 - index)
      date.setHours(0, 0, 0, 0)
      return date
    })
    return {
      topOrderRevenue: paid.reduce((sum, item) => sum + Number(item.amount), 0),
      adRevenue: 0,
      trend: days.map((date) => {
        const next = new Date(date.getTime() + 24 * 60 * 60 * 1000)
        return paid
          .filter((item) => item.createdAt >= date && item.createdAt < next)
          .reduce((sum, item) => sum + Number(item.amount), 0)
      })
    }
  }

  async listContent(resource: keyof typeof contentResourceMap, query: Record<string, unknown>) {
    const type = contentResourceMap[resource]
    if (!type) throw new NotFoundException('资源不存在')
    const { page, pageSize, skip, take } = getPagination(query)
    const where = this.contentWhere(type, query)
    const orderBy = this.contentOrder(query)
    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({ where, skip, take, orderBy, include: this.contentInclude() }),
      this.prisma.contentItem.count({ where })
    ])
    return pageResult(items.map((item) => this.serializeContent(item)), total, page, pageSize)
  }

  async listFeatured(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = getPagination(query)
    const where = this.contentWhere('jobs', query) as any
    where.type = { not: 'news' }
    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({
        where,
        skip,
        take,
        orderBy: [{ isRecommended: 'desc' }, { isTop: 'desc' }, { topPriority: 'desc' }, { createdAt: 'desc' }],
        include: this.contentInclude()
      }),
      this.prisma.contentItem.count({ where })
    ])
    return pageResult(items.map((item) => this.serializeContent(item)), total, page, pageSize)
  }

  async exportContent(resource: keyof typeof contentResourceMap, query: Record<string, unknown>) {
    const type = contentResourceMap[resource]
    if (!type) throw new NotFoundException('资源不存在')
    const items = await this.prisma.contentItem.findMany({
      where: this.contentWhere(type, query),
      include: this.contentInclude(),
      orderBy: this.contentOrder(query),
      take: 5000
    })
    return this.csv(`${resource}.csv`, ['标题', '分类', '发布人', '联系电话', '状态', '置顶', '推荐', '发布时间'], items.map((item) => [
      item.title,
      item.tag,
      item.publisher || item.contact,
      item.phone,
      item.status,
      item.isTop ? '是' : '否',
      item.isRecommended ? '是' : '否',
      this.formatDate(item.createdAt)
    ]))
  }

  async createContent(resource: keyof typeof contentResourceMap, body: unknown, operator: string, ip?: string) {
    const type = contentResourceMap[resource]
    if (!type) throw new NotFoundException('资源不存在')
    const data = parseBody(contentSchema.extend({ title: z.string().min(2).max(128) }), body)
    const { images, highlights, ...content } = data
    const item = await this.prisma.contentItem.create({
      data: {
        type,
        title: content.title,
        tag: content.tag || '未分类',
        price: content.price || null,
        address: content.address || null,
        contact: content.contact || operator,
        phone: content.phone || '',
        publisher: content.publisher || operator,
        status: content.status || 'pending',
        summary: content.summary || null,
        ...this.contentPayload(content),
        imageItems: {
          create: (images || []).map((url, index) => ({ url, sortOrder: index }))
        },
        highlightItems: {
          create: (highlights || []).map((text, index) => ({ text, sortOrder: index }))
        }
      },
      include: this.contentInclude()
    })
    await this.log(operator, '新增内容', item.title, ip)
    return this.serializeContent(item)
  }

  async updateContent(resource: keyof typeof contentResourceMap, id: string, body: unknown, operator: string, ip?: string) {
    const type = contentResourceMap[resource]
    if (!type) throw new NotFoundException('资源不存在')
    const data = parseBody(contentSchema, body)
    const exists = await this.prisma.contentItem.findFirst({ where: { id, type } })
    if (!exists) throw new NotFoundException('内容不存在')
    await this.replaceContentAssets(id, data.highlights, data.images)
    const item = await this.prisma.contentItem.update({
      where: { id },
      data: this.contentPayload(data),
      include: this.contentInclude()
    })
    await this.log(operator, '编辑内容', item.title, ip)
    return this.serializeContent(item)
  }

  async deleteContent(resource: keyof typeof contentResourceMap, id: string, operator: string, ip?: string) {
    const type = contentResourceMap[resource]
    if (!type) throw new NotFoundException('资源不存在')
    const exists = await this.prisma.contentItem.findFirst({ where: { id, type } })
    if (!exists) throw new NotFoundException('内容不存在')
    const item = await this.prisma.contentItem.update({ where: { id }, data: { status: 'deleted', isTop: false, isRecommended: false } })
    await this.log(operator, '删除内容', item.title, ip)
    return null
  }

  async batchContentStatus(resource: keyof typeof contentResourceMap, body: unknown, operator: string, ip?: string) {
    const type = contentResourceMap[resource]
    if (!type) throw new NotFoundException('资源不存在')
    const ids = parseBody(batchIdsSchema, body).ids
    const data = parseBody(statusSchema, body)
    const affected = await this.prisma.contentItem.findMany({ where: { id: { in: ids }, type }, select: { title: true } })
    const result = await this.prisma.contentItem.updateMany({
      where: { id: { in: ids }, type },
      data: {
        status: data.status,
        rejectReason: data.rejectReason || null,
        offlineReason: data.offlineReason || null
      }
    })
    for (const row of affected) {
      await this.notifyContentStatus(row.title, data.status, data.rejectReason || data.offlineReason)
    }
    await this.log(operator, `批量内容状态变更为${data.status}`, `${type} ${result.count}条`, ip)
    return result
  }

  async batchDeleteContent(resource: keyof typeof contentResourceMap, body: unknown, operator: string, ip?: string) {
    const type = contentResourceMap[resource]
    if (!type) throw new NotFoundException('资源不存在')
    const ids = parseBody(batchIdsSchema, body).ids
    const result = await this.prisma.contentItem.updateMany({
      where: { id: { in: ids }, type },
      data: { status: 'deleted', isTop: false, isRecommended: false }
    })
    await this.log(operator, '批量删除内容', `${type} ${result.count}条`, ip)
    return result
  }

  private contentWhere(type: string, query: Record<string, unknown>) {
    const status = query.status ? String(query.status) : undefined
    const tag = query.tag ? String(query.tag) : undefined
    const ownerType = query.ownerType ? String(query.ownerType) : undefined
    const isTop = query.isTop === 'true' ? true : query.isTop === 'false' ? false : undefined
    const isRecommended = query.isRecommended === 'true' ? true : query.isRecommended === 'false' ? false : undefined
    const keyword = query.keyword || query.q ? String(query.keyword || query.q) : undefined
    const startedAt = query.startedAt ? new Date(String(query.startedAt)) : undefined
    const endedAt = query.endedAt ? new Date(String(query.endedAt)) : undefined
    return {
      type,
      ...(status ? { status } : { status: { not: 'deleted' } }),
      ...(tag ? { tag } : {}),
      ...(ownerType ? { ownerType } : {}),
      ...(isTop !== undefined ? { isTop } : {}),
      ...(isRecommended !== undefined ? { isRecommended } : {}),
      ...(startedAt || endedAt ? { createdAt: { ...(startedAt ? { gte: startedAt } : {}), ...(endedAt ? { lte: endedAt } : {}) } } : {}),
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword } },
              { publisher: { contains: keyword } },
              { contact: { contains: keyword } },
              { phone: { contains: keyword } }
            ]
          }
        : {})
    }
  }

  private contentOrder(query: Record<string, unknown>): any[] {
    const sortBy = String(query.sortBy || 'createdAt')
    const order = query.order === 'asc' ? 'asc' : 'desc'
    if (!['createdAt', 'updatedAt', 'topPriority', 'title', 'status'].includes(sortBy)) {
      return [{ isTop: 'desc' }, { topPriority: 'desc' }, { createdAt: 'desc' }]
    }
    return [{ isTop: 'desc' }, { topPriority: 'desc' }, { [sortBy]: order }]
  }

  async contentDetail(resource: keyof typeof contentResourceMap, id: string) {
    const type = contentResourceMap[resource]
    const item = await this.prisma.contentItem.findFirst({ where: { id, type }, include: this.contentInclude() })
    if (!item) throw new NotFoundException('内容不存在')
    return this.serializeContent(item)
  }

  async updateContentStatus(resource: keyof typeof contentResourceMap, id: string, body: unknown, operator: string, ip?: string) {
    const type = contentResourceMap[resource]
    const data = parseBody(statusSchema, body)
    const exists = await this.prisma.contentItem.findFirst({ where: { id, type } })
    if (!exists) throw new NotFoundException('内容不存在')
    const item = await this.prisma.contentItem.update({
      where: { id },
      data: {
        status: data.status,
        rejectReason: data.rejectReason || null,
        offlineReason: data.offlineReason || null
      },
      include: this.contentInclude()
    })
    await this.notifyContentStatus(item.title, data.status, data.rejectReason || data.offlineReason)
    await this.log(operator, `内容状态变更为${data.status}`, item.title, ip)
    return this.serializeContent(item)
  }

  async updateTop(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(topSchema, body)
    const item = await this.prisma.contentItem.update({
      where: { id },
      data: {
        isTop: data.isTop,
        topPriority: data.topPriority,
        topExpireAt: data.topExpireAt ? new Date(data.topExpireAt) : null
      },
      include: this.contentInclude()
    })
    await this.log(operator, data.isTop ? '设置置顶' : '取消置顶', item.title, ip)
    return this.serializeContent(item)
  }

  async addRecruitmentBlacklist(body: any, operator: string, ip?: string) {
    if (!body.phone && !body.userId) throw new BadRequestException('手机号或用户ID不能为空')
    const item = await this.prisma.recruitmentBlacklist.create({
      data: {
        phone: body.phone || null,
        userId: body.userId || null,
        reason: body.reason || null,
        operator
      }
    })
    await this.log(operator, '加入招聘黑名单', body.phone || body.userId, ip)
    return item
  }

  async updateRecommend(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(recommendSchema, body)
    const item = await this.prisma.contentItem.update({
      where: { id },
      data: { isRecommended: data.isRecommended },
      include: this.contentInclude()
    })
    await this.log(operator, data.isRecommended ? '设置精选推荐' : '取消精选推荐', item.title, ip)
    return this.serializeContent(item)
  }

  async createArticle(body: unknown, operator: string, ip?: string) {
    const data = parseBody(articleSchema, body)
    const item = await this.prisma.contentItem.create({
      data: {
        type: 'news',
        title: data.title,
        tag: data.tag || '公告',
        price: data.price || '平台发布',
        address: data.address || '',
        contact: data.contact || '平台编辑部',
        phone: data.phone || '',
        publisher: data.publisher || operator,
        status: data.status || 'approved',
        summary: data.summary || '',
        ...(data.details ? { details: data.details as any } : {}),
        isTop: data.isTop || false,
        isRecommended: data.isRecommended || false,
        highlightItems: {
          create: (data.highlights || ['资讯']).map((text, index) => ({ text, sortOrder: index }))
        },
        imageItems: {
          create: (data.images || []).map((url, index) => ({ url, sortOrder: index }))
        }
      },
      include: this.contentInclude()
    })
    await this.log(operator, '发布资讯', item.title, ip)
    return this.serializeContent(item)
  }

  async updateArticle(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(articleSchema.partial(), body)
    await this.replaceContentAssets(id, data.highlights, data.images)
    const item = await this.prisma.contentItem.update({
      where: { id },
      data: this.articlePayload(data),
      include: this.contentInclude()
    })
    await this.log(operator, '编辑资讯', item.title, ip)
    return this.serializeContent(item)
  }

  async deleteArticle(id: string, operator: string, ip?: string) {
    const item = await this.prisma.contentItem.update({ where: { id }, data: { status: 'deleted', isTop: false } })
    await this.log(operator, '删除资讯', item.title, ip)
    return null
  }

  async companies() {
    return this.prisma.company.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async agencies() {
    return this.prisma.agency.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async listCategories(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = getPagination(query)
    const where = query.group ? { group: String(query.group) } : {}
    const [items, total] = await Promise.all([
      this.prisma.resourceCategory.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.resourceCategory.count({ where })
    ])
    return pageResult(items, total, page, pageSize)
  }

  async createCategory(body: unknown) {
    const data = parseBody(categorySchema, body)
    return this.prisma.resourceCategory.create({
      data: {
        group: data.group || 'secondhand',
        name: data.name,
        status: data.status || 'enabled'
      }
    })
  }

  async updateCategory(id: string, body: unknown) {
    return this.prisma.resourceCategory.update({ where: { id }, data: parseBody(categorySchema.partial(), body) })
  }

  async deleteCategory(id: string) {
    await this.prisma.resourceCategory.delete({ where: { id } })
    return null
  }

  async shopCategories() {
    return this.prisma.resourceCategory.findMany({ where: { group: 'yellowPages', status: 'enabled' }, orderBy: { name: 'asc' } })
  }

  async articleCategories() {
    return this.prisma.articleCategory.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async adPositions() {
    return this.prisma.adPosition.findMany({ include: { ads: true }, orderBy: { createdAt: 'desc' } })
  }

  async createAdPosition(body: unknown, operator: string, ip?: string) {
    const data = parseBody(adPositionSchema, body)
    const item = await this.prisma.adPosition.create({ data })
    await this.log(operator, '新增广告位', item.name, ip)
    return item
  }

  async updateAdPosition(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(adPositionSchema.partial(), body)
    const item = await this.prisma.adPosition.update({ where: { id }, data })
    await this.log(operator, '编辑广告位', item.name, ip)
    return item
  }

  async deleteAdPosition(id: string, operator: string, ip?: string) {
    const item = await this.prisma.adPosition.delete({ where: { id } })
    await this.log(operator, '删除广告位', item.name, ip)
    return null
  }

  async addAd(positionId: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(adSchema, body)
    const ad = await this.prisma.ad.create({
      data: {
        positionId,
        title: data.title || '新广告',
        image: data.image || null,
        linkType: data.linkType || 'category',
        linkValue: data.linkValue || 'jobs',
        status: data.status || 'enabled',
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null
      }
    })
    await this.log(operator, '新增广告', ad.title, ip)
    return ad
  }

  async updateAd(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(adSchema, body)
    const ad = await this.prisma.ad.update({
      where: { id },
      data: {
        ...data,
        startAt: data.startAt ? new Date(data.startAt) : data.startAt === null ? null : undefined,
        endAt: data.endAt ? new Date(data.endAt) : data.endAt === null ? null : undefined
      }
    })
    await this.log(operator, '编辑广告', ad.title, ip)
    return ad
  }

  async deleteAd(id: string, operator: string, ip?: string) {
    const ad = await this.prisma.ad.delete({ where: { id } })
    await this.log(operator, '删除广告', ad.title, ip)
    return null
  }

  async adStats(id: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id }, include: { adPosition: true } })
    if (!ad) throw new NotFoundException('广告不存在')
    return { adId: ad.id, title: ad.title, pv: ad.adPosition.pv, uv: ad.adPosition.uv, ctr: ad.adPosition.ctr }
  }

  async topOrders() {
    return this.prisma.topOrder.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async listUsers(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = getPagination(query)
    const keyword = query.keyword || query.q ? String(query.keyword || query.q) : undefined
    const status = query.status ? String(query.status) : undefined
    const where = {
      ...(status ? { status } : {}),
      ...(keyword ? { OR: [{ nickname: { contains: keyword } }, { phone: { contains: keyword } }, { username: { contains: keyword } }] } : {})
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where })
    ])
    // 剔除口令哈希等敏感字段
    return pageResult(items.map(({ passwordHash, ...rest }) => rest), total, page, pageSize)
  }

  async user(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('用户不存在')
    const { passwordHash, ...rest } = user
    return rest
  }

  async batchUserStatus(body: unknown, operator: string, ip?: string) {
    const ids = parseBody(batchIdsSchema, body).ids
    const data = parseBody(statusSchema.pick({ status: true }), body)
    const result = await this.prisma.user.updateMany({ where: { id: { in: ids } }, data: { status: data.status } })
    await this.log(operator, `批量用户状态变更为${data.status}`, `${result.count}人`, ip)
    return result
  }

  async exportUsers(query: Record<string, unknown>) {
    const users = await this.prisma.user.findMany({
      where: this.userWhere(query),
      orderBy: { createdAt: 'desc' },
      take: 5000
    })
    return this.csv('users.csv', ['昵称', '手机号', '状态', '发布数', '收藏数', '注册时间'], users.map((item) => [
      item.nickname,
      this.maskPhone(item.phone),
      item.status,
      item.publishCount,
      item.favoriteCount,
      this.formatDate(item.createdAt)
    ]))
  }

  async updateUserStatus(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(statusSchema.pick({ status: true }), body)
    const user = await this.prisma.user.update({ where: { id }, data: { status: data.status } })
    await this.log(operator, `用户状态变更为${data.status}`, user.nickname, ip)
    return user
  }

  async certifications(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = getPagination(query)
    const status = query.status ? String(query.status) : undefined
    const where = status ? { status } : {}
    const [items, total] = await Promise.all([
      this.prisma.certification.findMany({ where, skip, take, orderBy: { submittedAt: 'desc' } }),
      this.prisma.certification.count({ where })
    ])
    return pageResult(items, total, page, pageSize)
  }

  async updateCertification(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(statusSchema.pick({ status: true, rejectReason: true }), body)
    const item = await this.prisma.certification.update({
      where: { id },
      data: { status: data.status, rejectReason: data.rejectReason || null }
    })
    await this.log(operator, `认证${data.status}`, item.applicant, ip)
    return item
  }

  async reports(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = getPagination(query)
    const status = query.status ? String(query.status) : undefined
    const where = status ? { status } : {}
    const [items, total] = await Promise.all([
      this.prisma.report.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.report.count({ where })
    ])
    return pageResult(items, total, page, pageSize)
  }

  // 审核结果同步到用户消息中心（开发指南：信息审核通过/不通过 → 发送系统通知）
  private async notifyContentStatus(title: string, status: string, reason?: string | null) {
    const notice =
      status === 'approved'
        ? { title: '审核通过', body: `您发布的“${title}”已通过审核并上线展示。` }
        : status === 'rejected'
          ? { title: '审核未通过', body: `您发布的“${title}”未通过审核：${reason || '内容不符合发布规范'}` }
          : status === 'offline'
            ? { title: '信息已下架', body: `您发布的“${title}”已被平台下架${reason ? `：${reason}` : ''}。` }
            : null
    if (!notice) return
    await this.prisma.message.create({ data: notice })
  }

  async updateReport(id: string, body: any, operator: string, ip?: string) {
    const downContent = Boolean(body.downContent)
    const status = body.status || 'handled'
    const item = await this.prisma.report.update({
      where: { id },
      data: { status, result: body.result || (status === 'rejected' ? '经核实无违规，举报不成立' : '已处理') }
    })
    if (downContent) {
      await this.prisma.contentItem.updateMany({
        where: { id: item.targetId },
        data: { status: 'offline', offlineReason: item.reason }
      })
    }
    await this.prisma.message.create({
      data: {
        title: '举报处理结果',
        body: `关于“${item.targetTitle}”的举报${item.status === 'rejected' ? '经核实不成立' : '已处理'}：${item.result || '已处理'}`
      }
    })
    await this.log(operator, '处理举报', item.targetTitle, ip)
    return item
  }

  async adminAccounts(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = getPagination(query)
    const keyword = query.keyword || query.q ? String(query.keyword || query.q) : undefined
    const where = {
      username: { not: null },
      ...(keyword ? { OR: [{ username: { contains: keyword } }, { nickname: { contains: keyword } }, { phone: { contains: keyword } }] } : {})
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take, include: { roles: { include: { role: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where })
    ])
    return pageResult(items.map((item) => this.serializeAdminAccount(item)), total, page, pageSize)
  }

  async createAdminAccount(body: unknown, operator: string, ip?: string) {
    const data = parseBody(adminAccountSchema.extend({ password: z.string().min(6).max(64) }), body)
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        passwordHash: await hash(data.password, 10),
        nickname: data.nickname,
        phone: data.phone || null,
        email: data.email || null,
        status: data.status
      }
    })
    await this.replaceUserRoles(user.id, data.roleIds || [])
    await this.log(operator, '新增管理员账号', user.username || user.nickname, ip)
    return this.userAdminAccount(user.id)
  }

  async updateAdminAccount(id: string, body: unknown, operator: string, ip?: string) {
    // 编辑表单中密码/邮箱留空表示「不修改/清除」，不应触发格式校验
    const raw = body && typeof body === 'object' ? { ...(body as Record<string, unknown>) } : {}
    if (raw.password === '') delete raw.password
    if (raw.email === '') raw.email = null
    const data = parseBody(adminAccountSchema.partial(), raw)
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        nickname: data.nickname,
        phone: data.phone,
        email: data.email,
        status: data.status,
        ...(data.password ? { passwordHash: await hash(data.password, 10) } : {})
      }
    })
    if (data.roleIds) await this.replaceUserRoles(id, data.roleIds)
    await this.log(operator, '编辑管理员账号', user.username || user.nickname, ip)
    return this.userAdminAccount(id)
  }

  async deleteAdminAccount(id: string, operator: string, ip?: string) {
    const user = await this.prisma.user.delete({ where: { id } })
    await this.log(operator, '删除管理员账号', user.username || user.nickname, ip)
    return null
  }

  async roles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { createdAt: 'desc' }
    })
  }

  async createRole(body: unknown) {
    const data = parseBody(roleSchema, body)
    const role = await this.prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null
      }
    })
    if (data.permissions?.length) {
      await this.prisma.rolePermission.createMany({
        data: data.permissions.map((permissionId) => ({ roleId: role.id, permissionId })),
        skipDuplicates: true
      })
    }
    return this.prisma.role.findUnique({ where: { id: role.id }, include: { permissions: { include: { permission: true } } } })
  }

  async updateRole(id: string, body: unknown) {
    const data = parseBody(roleSchema.partial(), body)
    return this.prisma.role.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description
      }
    })
  }

  async deleteRole(id: string) {
    await this.prisma.role.delete({ where: { id } })
    return null
  }

  async permissions() {
    return this.prisma.permission.findMany({ orderBy: { code: 'asc' } })
  }

  async updateRolePermissions(id: string, body: any) {
    const permissionIds = Array.isArray(body.permissions) ? body.permissions : []
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } })
    if (permissionIds.length) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId: string) => ({ roleId: id, permissionId }))
      })
    }
    return this.prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } })
  }

  async userRoles(id: string) {
    const rows = await this.prisma.userRole.findMany({ where: { userId: id }, include: { role: true } })
    return { userId: id, roles: rows.map((item) => item.role) }
  }

  async updateUserRoles(id: string, body: any) {
    const roleIds = Array.isArray(body.roleIds) ? body.roleIds : []
    await this.prisma.userRole.deleteMany({ where: { userId: id } })
    if (roleIds.length) {
      await this.prisma.userRole.createMany({ data: roleIds.map((roleId: string) => ({ userId: id, roleId })) })
    }
    return this.userRoles(id)
  }

  async settings() {
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

  async updateSettings(body: any, operator: string, ip?: string) {
    const auditRequiredTypes = Array.isArray(body.auditRequiredTypes) ? body.auditRequiredTypes : []
    const setting = await this.prisma.platformSetting.upsert({
      where: { id: 'platform' },
      update: this.platformSettingPayload(body),
      create: { id: 'platform', ...this.platformSettingPayload(body) }
    })
    await this.prisma.platformAuditRequiredType.deleteMany({ where: { settingId: setting.id } })
    if (auditRequiredTypes.length) {
      await this.prisma.platformAuditRequiredType.createMany({
        data: auditRequiredTypes.map((type: string) => ({ settingId: setting.id, type })),
        skipDuplicates: true
      })
    }
    await this.log(operator, '更新系统设置', 'platform', ip)
    return this.settings()
  }

  async sensitiveWords() {
    return this.prisma.sensitiveWord.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async addSensitiveWord(body: any) {
    if (!body.word) throw new BadRequestException('敏感词不能为空')
    return this.prisma.sensitiveWord.create({ data: { word: body.word, status: body.status || 'enabled' } })
  }

  async addSensitiveWords(body: any) {
    const words = Array.isArray(body.words) ? body.words.filter(Boolean) : []
    if (!words.length) throw new BadRequestException('敏感词不能为空')
    await this.prisma.sensitiveWord.createMany({
      data: words.map((word: string) => ({ word })),
      skipDuplicates: true
    })
    return this.sensitiveWords()
  }

  async deleteSensitiveWord(id: string) {
    await this.prisma.sensitiveWord.delete({ where: { id } })
    return null
  }

  async notices() {
    return this.prisma.notice.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async createNotice(body: unknown, operator: string, ip?: string) {
    const data = parseBody(noticeSchema, body)
    const item = await this.prisma.notice.create({
      data: {
        title: data.title,
        content: data.content || '',
        status: data.status || 'enabled'
      }
    })
    await this.log(operator, '发布公告', item.title, ip)
    return item
  }

  async updateNotice(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(noticeSchema.partial(), body)
    const item = await this.prisma.notice.update({ where: { id }, data })
    await this.log(operator, '编辑公告', item.title, ip)
    return item
  }

  async deleteNotice(id: string, operator: string, ip?: string) {
    const item = await this.prisma.notice.delete({ where: { id } })
    await this.log(operator, '删除公告', item.title, ip)
    return null
  }

  async operationLogs(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = getPagination(query)
    const where = this.logWhere(query)
    const [items, total] = await Promise.all([
      this.prisma.operationLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.operationLog.count({ where })
    ])
    return pageResult(items, total, page, pageSize)
  }

  async exportOperationLogs(query: Record<string, unknown>) {
    const logs = await this.prisma.operationLog.findMany({
      where: this.logWhere(query),
      orderBy: { createdAt: 'desc' },
      take: 5000
    })
    return this.csv('operation-logs.csv', ['操作人', '操作类型', '操作对象', 'IP', '操作时间'], logs.map((item) => [
      item.operator,
      item.action,
      item.target,
      item.ip || '',
      this.formatDate(item.createdAt)
    ]))
  }

  async loginLogs() {
    return this.prisma.loginLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  }

  async menus(query: Record<string, unknown> = {}) {
    const all = String(query.all || '') === 'true'
    const flat = String(query.flat || '') === 'true'
    const items = await this.prisma.adminMenu.findMany({
      where: all ? {} : { status: 'enabled' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    })
    const serialized = items.map((item) => this.serializeMenu(item))
    return flat ? serialized : this.menuTree(serialized)
  }

  async createMenu(body: unknown, operator: string, ip?: string) {
    const data = parseBody(menuSchema, body)
    if (data.parentId) await this.ensureMenu(data.parentId)
    const item = await this.prisma.adminMenu.create({ data: this.menuPayload(data) })
    await this.log(operator, '新增菜单', item.title, ip)
    return this.serializeMenu(item)
  }

  async updateMenu(id: string, body: unknown, operator: string, ip?: string) {
    const data = parseBody(menuSchema.partial(), body)
    await this.ensureMenu(id)
    if (data.parentId) {
      if (data.parentId === id) throw new BadRequestException('上级菜单不能选择自己')
      await this.ensureMenu(data.parentId)
    }
    const item = await this.prisma.adminMenu.update({ where: { id }, data: this.menuPayload(data) })
    await this.log(operator, '编辑菜单', item.title, ip)
    return this.serializeMenu(item)
  }

  async deleteMenu(id: string, operator: string, ip?: string) {
    const item = await this.prisma.adminMenu.delete({ where: { id } })
    await this.log(operator, '删除菜单', item.title, ip)
    return null
  }

  private async dashboardCards() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [pending, todayPublished, pendingReports, pendingCerts] = await Promise.all([
      this.prisma.contentItem.count({ where: { status: 'pending' } }),
      this.prisma.contentItem.count({ where: { createdAt: { gte: today } } }),
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.certification.count({ where: { status: 'pending' } })
    ])
    return [
      { label: '待审核信息', value: pending, trend: '实时' },
      { label: '今日发布', value: todayPublished, trend: '实时' },
      { label: '举报待处理', value: pendingReports, trend: '实时' },
      { label: '认证申请', value: pendingCerts, trend: '实时' }
    ]
  }

  private async userDataStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const week = this.daysAgo(7)
    const userWhere = { username: null }
    const [totalUsers, activeUsers, bannedUsers, todayNewUsers, weeklyNewUsers, publishCount] = await Promise.all([
      this.prisma.user.count({ where: userWhere }),
      this.prisma.user.count({ where: { ...userWhere, status: 'active' } }),
      this.prisma.user.count({ where: { ...userWhere, status: 'banned' } }),
      this.prisma.user.count({ where: { ...userWhere, registeredAt: { gte: today } } }),
      this.prisma.user.count({ where: { ...userWhere, registeredAt: { gte: week } } }),
      this.prisma.contentItem.count({ where: { status: { not: 'deleted' } } })
    ])
    return [
      { label: '用户总数', value: totalUsers, trend: '累计' },
      { label: '正常用户', value: activeUsers, trend: '可发布' },
      { label: '今日新增', value: todayNewUsers, trend: `近7日 ${weeklyNewUsers}` },
      { label: '封禁用户', value: bannedUsers, trend: '风控' },
      { label: '用户发布', value: publishCount, trend: '累计内容' }
    ]
  }

  private serializeContent(item: any) {
    const details = item.details && typeof item.details === 'object' && !Array.isArray(item.details) ? item.details : {}
    const relationHighlights = Array.isArray(item.highlightItems)
      ? item.highlightItems.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((entry: any) => entry.text)
      : []
    const relationImages = Array.isArray(item.imageItems)
      ? item.imageItems.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((entry: any) => entry.url)
      : []
    return {
      ...details,
      ...item,
      details,
      time: this.relativeTime(item.createdAt),
      highlights: relationHighlights.length ? relationHighlights : Array.isArray(item.highlights) ? item.highlights : [],
      images: relationImages.length ? relationImages : Array.isArray(item.images) ? item.images : [],
      imageItems: undefined,
      highlightItems: undefined
    }
  }

  private contentInclude() {
    return {
      imageItems: { orderBy: { sortOrder: 'asc' as const } },
      highlightItems: { orderBy: { sortOrder: 'asc' as const } }
    }
  }

  private serializeAdminAccount(item: any) {
    const { passwordHash, roles, ...user } = item
    return {
      ...user,
      roles: Array.isArray(roles) ? roles.map((row) => row.role) : []
    }
  }

  private async userAdminAccount(id: string) {
    const item = await this.prisma.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } })
    if (!item) throw new NotFoundException('管理员账号不存在')
    return this.serializeAdminAccount(item)
  }

  private async replaceUserRoles(userId: string, roleIds: string[]) {
    await this.prisma.userRole.deleteMany({ where: { userId } })
    if (roleIds.length) {
      await this.prisma.userRole.createMany({ data: roleIds.map((roleId) => ({ userId, roleId })), skipDuplicates: true })
    }
  }

  private contentPayload(data: z.infer<typeof contentSchema>) {
    const payload: any = {}
    const fields = [
      'title',
      'tag',
      'price',
      'address',
      'contact',
      'phone',
      'publisher',
      'status',
      'rejectReason',
      'offlineReason',
      'summary',
      'details',
      'isTop',
      'topPriority',
      'isRecommended',
      'company',
      'ownerType',
      'licenseNo',
      'packageName'
    ]
    for (const field of fields) {
      if ((data as any)[field] !== undefined) payload[field] = (data as any)[field]
    }
    if (data.topExpireAt !== undefined) payload.topExpireAt = data.topExpireAt ? new Date(data.topExpireAt) : null
    if (data.packageExpireAt !== undefined) payload.packageExpireAt = data.packageExpireAt ? new Date(data.packageExpireAt) : null
    return payload
  }

  private articlePayload(data: z.infer<typeof articleSchema> | Partial<z.infer<typeof articleSchema>>) {
    const payload: any = {}
    for (const field of ['title', 'tag', 'price', 'address', 'summary', 'isTop', 'contact', 'phone', 'publisher', 'status', 'isRecommended', 'details']) {
      if ((data as any)[field] !== undefined) payload[field] = (data as any)[field]
    }
    return payload
  }

  private async replaceContentAssets(id: string, highlights?: string[], images?: string[]) {
    if (images !== undefined) {
      await this.prisma.contentImage.deleteMany({ where: { contentId: id } })
      if (images.length) {
        await this.prisma.contentImage.createMany({
          data: images.map((url, index) => ({ contentId: id, url, sortOrder: index }))
        })
      }
    }
    if (highlights !== undefined) {
      await this.prisma.contentHighlight.deleteMany({ where: { contentId: id } })
      if (highlights.length) {
        await this.prisma.contentHighlight.createMany({
          data: highlights.map((text, index) => ({ contentId: id, text, sortOrder: index }))
        })
      }
    }
  }

  private platformSettingPayload(body: Record<string, any>) {
    return {
      appName: body.appName || '青柠本地生活',
      logo: body.logo || null,
      city: body.city || '舞阳',
      customerServicePhone: body.customerServicePhone || null,
      customerWechat: body.customerWechat || null,
      customerQq: body.customerQq || null,
      sensitiveStrategy: body.sensitiveStrategy || 'manual',
      newUserPublishDelayHours: Number(body.newUserPublishDelayHours || 0),
      userAgreement: body.userAgreement || null,
      privacyPolicy: body.privacyPolicy || null,
      aboutUs: body.aboutUs || null
    }
  }

  private userWhere(query: Record<string, unknown>) {
    const keyword = query.keyword || query.q ? String(query.keyword || query.q) : undefined
    const status = query.status ? String(query.status) : undefined
    return {
      ...(status ? { status } : {}),
      ...(keyword ? { OR: [{ nickname: { contains: keyword } }, { phone: { contains: keyword } }, { username: { contains: keyword } }] } : {})
    }
  }

  private logWhere(query: Record<string, unknown>) {
    const keyword = query.keyword || query.q ? String(query.keyword || query.q) : undefined
    const action = query.action ? String(query.action) : undefined
    return {
      ...(action ? { action: { contains: action } } : {}),
      ...(keyword ? { OR: [{ operator: { contains: keyword } }, { action: { contains: keyword } }, { target: { contains: keyword } }, { ip: { contains: keyword } }] } : {})
    }
  }

  private relativeTime(date: Date) {
    const seconds = Math.max(Math.floor((Date.now() - date.getTime()) / 1000), 0)
    if (seconds < 60) return '刚刚'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`
    if (seconds < 172800) return '昨天'
    return `${Math.floor(seconds / 86400)}天前`
  }

  private daysAgo(days: number) {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date
  }

  private csv(filename: string, headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>) {
    const content = [headers, ...rows]
      .map((row) => row.map((cell) => this.csvCell(cell)).join(','))
      .join('\n')
    return { filename, mimeType: 'text/csv;charset=utf-8', content: `\uFEFF${content}` }
  }

  private csvCell(value: string | number | boolean | null | undefined) {
    const text = value === null || value === undefined ? '' : String(value)
    return `"${text.replace(/"/g, '""')}"`
  }

  private formatDate(date: Date) {
    return date.toISOString().replace('T', ' ').slice(0, 19)
  }

  private maskPhone(phone?: string | null) {
    return phone ? phone.replace(/^(\d{3})\d{4}(\d+)/, '$1****$2') : ''
  }

  private serializeMenu(item: any) {
    return {
      id: item.id,
      parentId: item.parentId,
      title: item.title,
      path: item.path,
      component: item.component,
      icon: item.icon,
      permission: item.permission,
      sortOrder: item.sortOrder,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      children: []
    }
  }

  private menuTree(items: any[]) {
    const map = new Map(items.map((item) => [item.id, { ...item, children: [] }]))
    const roots: any[] = []
    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(item)
      } else {
        roots.push(item)
      }
    }
    return roots
  }

  private menuPayload(data: Partial<z.infer<typeof menuSchema>>) {
    const payload: any = {}
    for (const field of ['parentId', 'title', 'path', 'component', 'icon', 'permission', 'sortOrder', 'status']) {
      if ((data as any)[field] !== undefined) payload[field] = (data as any)[field] || null
    }
    if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder
    if (data.status !== undefined) payload.status = data.status
    return payload
  }

  private async ensureMenu(id: string) {
    const item = await this.prisma.adminMenu.findUnique({ where: { id } })
    if (!item) throw new NotFoundException('菜单不存在')
    return item
  }

  private async log(operator: string, action: string, target: string, ip?: string) {
    await this.prisma.operationLog.create({
      data: { operator, action, target, ip }
    })
  }
}
