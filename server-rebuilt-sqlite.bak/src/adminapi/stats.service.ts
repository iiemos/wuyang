import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CONTENT_TYPES, serializeListing, TYPE_LABELS } from '../common/listing.serializer'
import { startOfDay } from '../common/utils'

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const today = startOfDay()
    const [
      totalListings,
      todayListings,
      pendingListings,
      pendingReports,
      pendingCertifications,
      totalUsers,
      todayUsers,
      bannedUsers,
      totalViews,
      pendingRows,
      recentLogs
    ] = await Promise.all([
      this.prisma.listing.count({ where: { status: { not: 'deleted' } } }),
      this.prisma.listing.count({ where: { createdAt: { gte: today } } }),
      this.prisma.listing.count({ where: { status: 'pending' } }),
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.certification.count({ where: { status: 'pending' } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { status: 'banned' } }),
      this.prisma.listing.aggregate({ _sum: { viewCount: true } }),
      this.prisma.listing.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' }, take: 50 }),
      this.prisma.operationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 })
    ])

    const publication = await this.publicationStats()

    return {
      stats: [
        { label: '信息总量', value: totalListings, trend: `今日 +${todayListings}` },
        { label: '待审核', value: pendingListings, trend: pendingListings > 10 ? '需优先处理' : '正常' },
        { label: '待处理举报', value: pendingReports, trend: pendingReports ? '待跟进' : '无积压' },
        { label: '待审认证', value: pendingCertifications, trend: pendingCertifications ? '待跟进' : '无积压' }
      ],
      userStats: [
        { label: '用户总数', value: totalUsers, trend: `今日 +${todayUsers}` },
        { label: '今日新增', value: todayUsers, trend: '较昨日持平' },
        { label: '封禁用户', value: bannedUsers, trend: bannedUsers ? '需关注' : '无' },
        { label: '累计浏览', value: totalViews._sum.viewCount || 0, trend: '持续增长' }
      ],
      audits: pendingRows.map((row) => ({
        type: row.type,
        title: row.title,
        targetId: row.id,
        publisher: row.publisher || row.contact || '匿名用户',
        status: row.status
      })),
      publication,
      recentOperations: recentLogs.map((row) => ({
        id: row.id,
        operator: row.operator,
        action: row.action,
        target: row.target,
        createdAt: row.createdAt.toISOString()
      }))
    }
  }

  private async publicationStats() {
    const grouped = await this.prisma.listing.groupBy({ by: ['type', 'status'], _count: { _all: true } })
    return CONTENT_TYPES.map((type) => {
      const rows = grouped.filter((row) => row.type === type)
      const count = (status: string) => rows.find((row) => row.status === status)?._count._all || 0
      const total = rows.reduce((sum, row) => sum + row._count._all, 0) - count('deleted')
      const approved = count('approved')
      const rejected = count('rejected')
      const denominator = approved + rejected
      return {
        type,
        label: TYPE_LABELS[type],
        total,
        pending: count('pending'),
        passRate: denominator ? Math.round((approved / denominator) * 100) : 100
      }
    })
  }

  async dashboard() {
    return this.overview()
  }

  async operation() {
    const [pendingAudits, pendingReports, positions, revenue] = await Promise.all([
      this.prisma.listing.count({ where: { status: 'pending' } }),
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.adPosition.findMany({ include: { ads: true } }),
      this.revenue()
    ])
    const totalPv = positions.reduce((sum, item) => sum + item.pv, 0)
    const totalClicks = positions.reduce((sum, item) => sum + item.ads.reduce((s, ad) => s + ad.clickCount, 0), 0)
    return {
      pendingAudits,
      pendingReports,
      adCtr: totalPv ? `${((totalClicks / totalPv) * 100).toFixed(1)}%` : '0%',
      topOrderRevenue: revenue.topOrderRevenue
    }
  }

  async revenue() {
    const orders = await this.prisma.topOrder.findMany({ where: { status: 'paid' } })
    const total = orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0)

    const dayBuckets: number[] = []
    for (let i = 6; i >= 0; i -= 1) {
      const dayStart = startOfDay(new Date(Date.now() - i * 86400000))
      const dayEnd = new Date(dayStart.getTime() + 86400000)
      const dayTotal = orders
        .filter((order) => order.createdAt >= dayStart && order.createdAt < dayEnd)
        .reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
      dayBuckets.push(dayTotal)
    }
    const max = Math.max(...dayBuckets, 1)
    return {
      topOrderRevenue: Math.round(total * 100) / 100,
      trend: dayBuckets.map((value) => Math.round((value / max) * 100)),
      daily: dayBuckets
    }
  }
}
