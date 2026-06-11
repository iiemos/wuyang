import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { OperationLogService } from '../common/operation-log.service'
import { csvPayload, toPage } from '../common/utils'

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: OperationLogService
  ) {}

  private serializeUser(user: any) {
    return {
      id: user.id,
      username: user.username || '',
      nickname: user.nickname,
      phone: user.phone,
      email: user.email,
      status: user.status,
      publishCount: user._count ? user._count.listings : 0,
      favoriteCount: user._count ? user._count.favorites : 0,
      viewCount: user._count ? user._count.viewRecords : 0,
      registeredAt: user.createdAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null
    }
  }

  private buildWhere(query: Record<string, unknown>) {
    const where: Record<string, unknown> = {}
    const status = String(query.status || '')
    if (status) where.status = status
    const keyword = String(query.keyword || '').trim()
    if (keyword) {
      where.OR = [{ nickname: { contains: keyword } }, { phone: { contains: keyword } }, { email: { contains: keyword } }]
    }
    return where
  }

  async list(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = toPage(query, 20)
    const where = this.buildWhere(query)
    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where: where as any }),
      this.prisma.user.findMany({
        where: where as any,
        include: { _count: { select: { listings: true, favorites: true, viewRecords: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ])
    return { items: rows.map((row) => this.serializeUser(row)), total, page, pageSize }
  }

  async detail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { listings: true, favorites: true, viewRecords: true } } }
    })
    if (!user) throw new NotFoundException('用户不存在')
    return this.serializeUser(user)
  }

  async updateStatus(id: string, status: string, request: any) {
    if (!['active', 'banned'].includes(status)) throw new BadRequestException(`无效的状态：${status}`)
    const existing = await this.prisma.user.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('用户不存在')
    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
      include: { _count: { select: { listings: true, favorites: true, viewRecords: true } } }
    })
    await this.prisma.message.create({
      data: {
        userId: id,
        title: status === 'banned' ? '账号已被封禁' : '账号已恢复正常',
        desc: status === 'banned' ? '您的账号因违规被平台封禁，如有疑问请联系客服。' : '您的账号已解除封禁，可正常使用。'
      }
    })
    await this.logs.record(request, status === 'banned' ? '封禁用户' : '解封用户', user.nickname)
    return this.serializeUser(user)
  }

  async batchStatus(body: Record<string, unknown>, request: any) {
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : []
    const status = String(body.status || '')
    if (!ids.length) throw new BadRequestException('请选择要操作的用户')
    if (!['active', 'banned'].includes(status)) throw new BadRequestException(`无效的状态：${status}`)
    const result = await this.prisma.user.updateMany({ where: { id: { in: ids } }, data: { status } })
    await this.logs.record(request, status === 'banned' ? '批量封禁用户' : '批量解封用户', `${result.count} 个用户`)
    return { count: result.count }
  }

  async export(query: Record<string, unknown>) {
    const rows = await this.prisma.user.findMany({
      where: this.buildWhere(query) as any,
      include: { _count: { select: { listings: true, favorites: true, viewRecords: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5000
    })
    return csvPayload(
      `users-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', '昵称', '手机号', '邮箱', '状态', '发布数', '收藏数', '浏览数', '注册时间'],
      rows.map((row) => [
        row.id,
        row.nickname,
        row.phone,
        row.email,
        row.status === 'banned' ? '已封禁' : '正常',
        row._count.listings,
        row._count.favorites,
        row._count.viewRecords,
        row.createdAt.toISOString()
      ])
    )
  }

  // ============ 认证审核 ============

  private serializeCertification(row: any) {
    return {
      id: row.id,
      applicant: row.applicant,
      type: row.type,
      phone: row.phone,
      status: row.status,
      material: row.material,
      rejectReason: row.rejectReason,
      submittedAt: row.createdAt.toISOString()
    }
  }

  async listCertifications(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = toPage(query, 50)
    const where: Record<string, unknown> = {}
    const status = String(query.status || '')
    if (status) where.status = status
    const [total, rows] = await Promise.all([
      this.prisma.certification.count({ where: where as any }),
      this.prisma.certification.findMany({ where: where as any, orderBy: { createdAt: 'desc' }, skip, take })
    ])
    return { items: rows.map((row) => this.serializeCertification(row)), total, page, pageSize }
  }

  async updateCertification(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.certification.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('认证申请不存在')
    const status = String(body.status || '')
    if (!['pending', 'approved', 'rejected'].includes(status)) throw new BadRequestException(`无效的状态：${status}`)
    const row = await this.prisma.certification.update({
      where: { id },
      data: { status, rejectReason: status === 'rejected' ? String(body.rejectReason || '') : '' }
    })
    await this.logs.record(request, status === 'approved' ? '认证通过' : '认证驳回', `${row.applicant}（${row.type}）`)
    return this.serializeCertification(row)
  }

  // ============ 举报处理 ============

  private serializeReport(row: any) {
    return {
      id: row.id,
      targetId: row.targetId,
      targetTitle: row.targetTitle,
      reason: row.reason,
      reporter: row.reporter,
      status: row.status,
      result: row.result,
      createdAt: row.createdAt.toISOString()
    }
  }

  async listReports(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = toPage(query, 50)
    const where: Record<string, unknown> = {}
    const status = String(query.status || '')
    if (status) where.status = status
    const [total, rows] = await Promise.all([
      this.prisma.report.count({ where: where as any }),
      this.prisma.report.findMany({ where: where as any, orderBy: { createdAt: 'desc' }, skip, take })
    ])
    return { items: rows.map((row) => this.serializeReport(row)), total, page, pageSize }
  }

  async updateReport(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.report.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('举报记录不存在')
    const status = String(body.status || '')
    if (!['pending', 'handled', 'rejected'].includes(status)) throw new BadRequestException(`无效的状态：${status}`)

    const result = String(body.result || (status === 'handled' ? '经核实违规，已处理' : status === 'rejected' ? '经核实无违规' : ''))
    const row = await this.prisma.report.update({ where: { id }, data: { status, result } })

    // 判违规并下架被举报内容
    if (body.downContent && existing.targetId) {
      const listing = await this.prisma.listing.findUnique({ where: { id: existing.targetId } })
      if (listing) {
        await this.prisma.listing.update({ where: { id: listing.id }, data: { status: 'offline' } })
        if (listing.userId) {
          await this.prisma.message.create({
            data: {
              userId: listing.userId,
              title: '信息因举报被下架',
              desc: `您发布的「${listing.title}」经核实存在违规，已被平台下架。`
            }
          })
        }
      }
    }

    // 反馈举报人
    if (existing.userId) {
      await this.prisma.message.create({
        data: {
          userId: existing.userId,
          title: '举报处理结果',
          desc: `您对「${existing.targetTitle}」的举报已处理：${result || '感谢您的反馈'}`
        }
      })
    }

    await this.logs.record(request, '处理举报', existing.targetTitle)
    return this.serializeReport(row)
  }
}
