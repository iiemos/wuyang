import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { OperationLogService } from '../common/operation-log.service'
import { RESOURCE_TYPE, serializeListing, TYPE_LABELS } from '../common/listing.serializer'
import { csvPayload, randomToken, toDate, toJsonString, toPage } from '../common/utils'

const SORTABLE = new Set(['createdAt', 'updatedAt', 'topPriority', 'title', 'viewCount'])

@Injectable()
export class AdminContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: OperationLogService
  ) {}

  resolveType(resource: string): string {
    const type = RESOURCE_TYPE[resource]
    if (!type) throw new NotFoundException(`未知的内容资源：${resource}`)
    return type
  }

  private buildWhere(type: string | null, query: Record<string, unknown>) {
    const where: Record<string, unknown> = {}
    if (type) where.type = type
    const status = String(query.status || '')
    if (status) where.status = status
    const tag = String(query.tag || '')
    if (tag) where.tag = tag
    const isTop = String(query.isTop || '')
    if (isTop === 'true') where.isTop = true
    if (isTop === 'false') where.isTop = false
    const isRecommended = String(query.isRecommended || '')
    if (isRecommended === 'true') where.isRecommended = true
    if (isRecommended === 'false') where.isRecommended = false
    const keyword = String(query.keyword || '').trim()
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { publisher: { contains: keyword } },
        { contact: { contains: keyword } },
        { phone: { contains: keyword } },
        { summary: { contains: keyword } }
      ]
    }
    return where
  }

  private buildOrder(query: Record<string, unknown>) {
    const sortBy = String(query.sortBy || 'createdAt')
    const order = String(query.order || 'desc') === 'asc' ? 'asc' : 'desc'
    if (!SORTABLE.has(sortBy)) return [{ createdAt: 'desc' as const }]
    return [{ [sortBy]: order } as Record<string, 'asc' | 'desc'>]
  }

  async list(resource: string, query: Record<string, unknown>) {
    const type = this.resolveType(resource)
    return this.pagedList(this.buildWhere(type, query), query)
  }

  async featured(query: Record<string, unknown>) {
    const where = this.buildWhere(null, query)
    where.isRecommended = true
    return this.pagedList(where, query)
  }

  private async pagedList(where: Record<string, unknown>, query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = toPage(query, 20)
    const [total, rows] = await Promise.all([
      this.prisma.listing.count({ where: where as any }),
      this.prisma.listing.findMany({ where: where as any, orderBy: this.buildOrder(query) as any, skip, take })
    ])
    return { items: rows.map((row) => serializeListing(row)), total, page, pageSize }
  }

  async detail(resource: string, id: string) {
    const type = this.resolveType(resource)
    const listing = await this.prisma.listing.findUnique({ where: { id } })
    if (!listing || listing.type !== type) throw new NotFoundException('信息不存在')
    return serializeListing(listing)
  }

  private pickData(body: Record<string, unknown>) {
    const data: Record<string, unknown> = {}
    const textFields = ['tag', 'title', 'price', 'address', 'contact', 'phone', 'publisher', 'company', 'ownerType', 'summary', 'rejectReason']
    for (const field of textFields) {
      if (body[field] !== undefined) data[field] = String(body[field] ?? '')
    }
    if (body.status !== undefined) data.status = String(body.status)
    if (body.highlights !== undefined) data.highlights = toJsonString(body.highlights, '[]')
    if (body.images !== undefined) data.images = toJsonString(body.images, '[]')
    if (body.details !== undefined) data.details = toJsonString(body.details, '{}')
    if (body.isTop !== undefined) data.isTop = Boolean(body.isTop)
    if (body.topPriority !== undefined) data.topPriority = Number(body.topPriority) || 0
    if (body.topExpireAt !== undefined) data.topExpireAt = toDate(body.topExpireAt)
    if (body.isRecommended !== undefined) data.isRecommended = Boolean(body.isRecommended)
    return data
  }

  async create(resource: string, body: Record<string, unknown>, request: any) {
    const type = this.resolveType(resource)
    if (!body.title || !String(body.title).trim()) throw new BadRequestException('标题不能为空')
    const data = this.pickData(body)
    const listing = await this.prisma.listing.create({
      data: {
        ...(data as any),
        type,
        title: String(body.title),
        status: String(body.status || 'approved'),
        publisher: String(body.publisher || request?.admin?.nickname || '运营发布'),
        previewToken: randomToken()
      }
    })
    await this.logs.record(request, '新建内容', `${TYPE_LABELS[type]}：${listing.title}`)
    return serializeListing(listing)
  }

  async update(resource: string, id: string, body: Record<string, unknown>, request: any) {
    const type = this.resolveType(resource)
    const existing = await this.prisma.listing.findUnique({ where: { id } })
    if (!existing || existing.type !== type) throw new NotFoundException('信息不存在')
    const listing = await this.prisma.listing.update({ where: { id }, data: this.pickData(body) as any })
    await this.logs.record(request, '编辑内容', `${TYPE_LABELS[type]}：${listing.title}`)
    return serializeListing(listing)
  }

  async updateStatus(resource: string, id: string, body: Record<string, unknown>, request: any) {
    const type = this.resolveType(resource)
    const existing = await this.prisma.listing.findUnique({ where: { id } })
    if (!existing || existing.type !== type) throw new NotFoundException('信息不存在')

    const status = String(body.status || '')
    if (!['pending', 'approved', 'rejected', 'offline', 'deleted'].includes(status)) {
      throw new BadRequestException(`无效的状态：${status}`)
    }
    const rejectReason = String(body.rejectReason || '')
    const listing = await this.prisma.listing.update({
      where: { id },
      data: { status, rejectReason: status === 'rejected' ? rejectReason : existing.rejectReason }
    })

    await this.notifyOwner(listing, status, rejectReason)
    await this.logs.record(request, this.statusAction(status), `${TYPE_LABELS[type]}：${listing.title}`)
    return serializeListing(listing)
  }

  private statusAction(status: string) {
    return { approved: '审核通过', rejected: '审核拒绝', offline: '下架信息', deleted: '删除信息', pending: '重置待审' }[status] || '更新状态'
  }

  private async notifyOwner(listing: { userId: string | null; title: string }, status: string, rejectReason: string) {
    if (!listing.userId) return
    const texts: Record<string, { title: string; desc: string }> = {
      approved: { title: '审核通过', desc: `您发布的「${listing.title}」已通过审核并上线展示。` },
      rejected: { title: '审核未通过', desc: `您发布的「${listing.title}」未通过审核。原因：${rejectReason || '内容不符合发布规范'}` },
      offline: { title: '信息已下架', desc: `您发布的「${listing.title}」已被平台下架，如有疑问请联系客服。` }
    }
    const text = texts[status]
    if (!text) return
    await this.prisma.message.create({ data: { userId: listing.userId, title: text.title, desc: text.desc, unread: true } })
  }

  async batchStatus(resource: string, body: Record<string, unknown>, request: any) {
    const type = this.resolveType(resource)
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : []
    if (!ids.length) throw new BadRequestException('请选择要操作的数据')
    const status = String(body.status || '')
    const rejectReason = String(body.rejectReason || '')

    const rows = await this.prisma.listing.findMany({ where: { id: { in: ids }, type } })
    const result = await this.prisma.listing.updateMany({
      where: { id: { in: ids }, type },
      data: status === 'rejected' ? { status, rejectReason } : { status }
    })
    for (const row of rows) await this.notifyOwner(row, status, rejectReason)
    await this.logs.record(request, `批量${this.statusAction(status)}`, `${TYPE_LABELS[type]} ${result.count} 条`)
    return { count: result.count }
  }

  async batchDelete(resource: string, body: Record<string, unknown>, request: any) {
    const type = this.resolveType(resource)
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : []
    if (!ids.length) throw new BadRequestException('请选择要操作的数据')
    const result = await this.prisma.listing.updateMany({ where: { id: { in: ids }, type }, data: { status: 'deleted' } })
    await this.logs.record(request, '批量删除内容', `${TYPE_LABELS[type]} ${result.count} 条`)
    return { count: result.count }
  }

  async remove(resource: string, id: string, request: any) {
    const type = this.resolveType(resource)
    const existing = await this.prisma.listing.findUnique({ where: { id } })
    if (!existing || existing.type !== type) throw new NotFoundException('信息不存在')
    await this.prisma.listing.update({ where: { id }, data: { status: 'deleted' } })
    await this.logs.record(request, '删除信息', `${TYPE_LABELS[type]}：${existing.title}`)
    return null
  }

  async export(resource: string, query: Record<string, unknown>) {
    const type = this.resolveType(resource)
    const rows = await this.prisma.listing.findMany({
      where: this.buildWhere(type, query) as any,
      orderBy: this.buildOrder(query) as any,
      take: 2000
    })
    return csvPayload(
      `${resource}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', '类型', '标题', '标签', '价格', '地址', '联系人', '电话', '发布人', '状态', '创建时间'],
      rows.map((row) => [
        row.id,
        TYPE_LABELS[row.type] || row.type,
        row.title,
        row.tag,
        row.price,
        row.address,
        row.contact,
        row.phone,
        row.publisher,
        row.status,
        row.createdAt.toISOString()
      ])
    )
  }

  async setTop(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.listing.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('信息不存在')
    const isTop = Boolean(body.isTop)
    const listing = await this.prisma.listing.update({
      where: { id },
      data: {
        isTop,
        topPriority: isTop ? Number(body.topPriority) || 0 : 0,
        topExpireAt: isTop ? toDate(body.topExpireAt) : null
      }
    })
    await this.logs.record(request, isTop ? '设置置顶' : '取消置顶', listing.title)
    return serializeListing(listing)
  }

  async setRecommend(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.listing.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('信息不存在')
    const isRecommended = Boolean(body.isRecommended)
    const listing = await this.prisma.listing.update({ where: { id }, data: { isRecommended } })
    await this.logs.record(request, isRecommended ? '设为推荐' : '取消推荐', listing.title)
    return serializeListing(listing)
  }

  // ============ 分类管理 ============

  async listCategories(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = toPage(query, 50)
    const where: Record<string, unknown> = {}
    const group = String(query.group || '')
    if (group) where.group = group
    const [total, rows] = await Promise.all([
      this.prisma.category.count({ where: where as any }),
      this.prisma.category.findMany({ where: where as any, orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }], skip, take })
    ])
    return {
      items: rows.map((row) => ({
        id: row.id,
        group: row.group,
        name: row.name,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      })),
      total,
      page,
      pageSize
    }
  }

  async createCategory(body: Record<string, unknown>, request: any) {
    const group = String(body.group || '')
    const name = String(body.name || '').trim()
    if (!group || !name) throw new BadRequestException('分类组和名称不能为空')
    const existing = await this.prisma.category.findUnique({ where: { group_name: { group, name } } })
    if (existing) throw new BadRequestException('该分类已存在')
    const category = await this.prisma.category.create({
      data: { group, name, status: String(body.status || 'enabled') }
    })
    await this.logs.record(request, '新增分类', `${group}/${name}`)
    return category
  }

  async updateCategory(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.category.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('分类不存在')
    const data: Record<string, unknown> = {}
    if (body.group !== undefined) data.group = String(body.group)
    if (body.name !== undefined) data.name = String(body.name)
    if (body.status !== undefined) data.status = String(body.status)
    const category = await this.prisma.category.update({ where: { id }, data: data as any })
    await this.logs.record(request, '编辑分类', `${category.group}/${category.name}`)
    return category
  }

  async deleteCategory(id: string, request: any) {
    const existing = await this.prisma.category.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('分类不存在')
    await this.prisma.category.delete({ where: { id } })
    await this.logs.record(request, '删除分类', `${existing.group}/${existing.name}`)
    return null
  }
}
