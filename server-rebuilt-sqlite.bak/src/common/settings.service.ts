import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  appName: '青柠本地生活',
  logo: '',
  city: '舞阳',
  customerServicePhone: '0395-0000000',
  customerWechat: 'qingning-service',
  customerQq: '',
  auditRequiredTypes: ['jobs', 'houses', 'convenience', 'yellowPages', 'secondhand'],
  sensitiveStrategy: 'manual',
  newUserPublishDelayHours: 0,
  userAgreement: '欢迎使用青柠本地生活平台，发布信息请遵守相关法律法规。',
  privacyPolicy: '我们仅在提供服务所必需的范围内收集和使用您的信息。',
  aboutUs: '青柠本地生活：聚合招聘、房源、便民、商家服务、二手与本地资讯。'
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany()
    const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS }
    for (const row of rows) {
      try {
        merged[row.key] = JSON.parse(row.value)
      } catch {
        merged[row.key] = row.value
      }
    }
    return merged
  }

  async update(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const entries = Object.entries(data || {}).filter(([key]) => key)
    for (const [key, value] of entries) {
      const serialized = JSON.stringify(value === undefined ? null : value)
      await this.prisma.setting.upsert({
        where: { key },
        update: { value: serialized },
        create: { key, value: serialized }
      })
    }
    return this.getAll()
  }
}
