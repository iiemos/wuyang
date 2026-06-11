import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { OperationLogService } from '../common/operation-log.service'
import { toDate } from '../common/utils'

@Injectable()
export class AdminOperationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: OperationLogService
  ) {}

  private serializeAd(ad: any) {
    return {
      id: ad.id,
      positionId: ad.positionId,
      title: ad.title,
      desc: ad.desc,
      image: ad.image,
      linkType: ad.linkType,
      linkValue: ad.linkValue,
      status: ad.status,
      startAt: ad.startAt ? ad.startAt.toISOString() : null,
      endAt: ad.endAt ? ad.endAt.toISOString() : null,
      clickCount: ad.clickCount,
      createdAt: ad.createdAt.toISOString()
    }
  }

  private serializePosition(position: any) {
    const clicks = (position.ads || []).reduce((sum: number, ad: any) => sum + (ad.clickCount || 0), 0)
    const ctr = position.pv > 0 ? `${((clicks / position.pv) * 100).toFixed(1)}%` : '0%'
    return {
      id: position.id,
      name: position.name,
      scene: position.scene,
      pv: position.pv,
      uv: position.uv,
      ctr,
      ads: (position.ads || []).map((ad: any) => this.serializeAd(ad))
    }
  }

  async listPositions() {
    const rows = await this.prisma.adPosition.findMany({
      include: { ads: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'asc' }
    })
    return rows.map((row) => this.serializePosition(row))
  }

  async createPosition(body: Record<string, unknown>, request: any) {
    const name = String(body.name || '').trim()
    if (!name) throw new BadRequestException('广告位名称不能为空')
    const position = await this.prisma.adPosition.create({
      data: { name, scene: String(body.scene || 'home') },
      include: { ads: true }
    })
    await this.logs.record(request, '新增广告位', name)
    return this.serializePosition(position)
  }

  async updatePosition(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.adPosition.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('广告位不存在')
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = String(body.name)
    if (body.scene !== undefined) data.scene = String(body.scene)
    const position = await this.prisma.adPosition.update({
      where: { id },
      data: data as any,
      include: { ads: { orderBy: { createdAt: 'asc' } } }
    })
    await this.logs.record(request, '编辑广告位', position.name)
    return this.serializePosition(position)
  }

  async deletePosition(id: string, request: any) {
    const existing = await this.prisma.adPosition.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('广告位不存在')
    await this.prisma.adPosition.delete({ where: { id } })
    await this.logs.record(request, '删除广告位', existing.name)
    return null
  }

  private pickAdData(body: Record<string, unknown>) {
    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = String(body.title)
    if (body.desc !== undefined) data.desc = String(body.desc)
    if (body.image !== undefined) data.image = String(body.image)
    if (body.linkType !== undefined) data.linkType = String(body.linkType)
    if (body.linkValue !== undefined) data.linkValue = String(body.linkValue)
    if (body.status !== undefined) data.status = String(body.status)
    if (body.startAt !== undefined) data.startAt = toDate(body.startAt)
    if (body.endAt !== undefined) data.endAt = toDate(body.endAt)
    return data
  }

  async addAd(positionId: string, body: Record<string, unknown>, request: any) {
    const position = await this.prisma.adPosition.findUnique({ where: { id: positionId } })
    if (!position) throw new NotFoundException('广告位不存在')
    if (!body.title || !String(body.title).trim()) throw new BadRequestException('广告标题不能为空')
    const ad = await this.prisma.ad.create({
      data: { ...(this.pickAdData(body) as any), title: String(body.title), positionId }
    })
    await this.logs.record(request, '新增广告', `${position.name}：${ad.title}`)
    return this.serializeAd(ad)
  }

  async updateAd(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.ad.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('广告不存在')
    const ad = await this.prisma.ad.update({ where: { id }, data: this.pickAdData(body) as any })
    await this.logs.record(request, '编辑广告', ad.title)
    return this.serializeAd(ad)
  }

  async deleteAd(id: string, request: any) {
    const existing = await this.prisma.ad.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('广告不存在')
    await this.prisma.ad.delete({ where: { id } })
    await this.logs.record(request, '删除广告', existing.title)
    return null
  }

  async listTopOrders() {
    const rows = await this.prisma.topOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
    return rows.map((row) => ({
      id: row.id,
      targetId: row.targetId,
      targetTitle: row.targetTitle,
      buyer: row.buyer,
      amount: row.amount,
      status: row.status,
      startedAt: row.startedAt.toISOString(),
      expiredAt: row.expiredAt.toISOString(),
      createdAt: row.createdAt.toISOString()
    }))
  }
}
