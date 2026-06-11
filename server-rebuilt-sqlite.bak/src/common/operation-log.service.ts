import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Injectable()
export class OperationLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(request: any, action: string, target: string) {
    const operator = request?.admin?.nickname || request?.admin?.username || '系统'
    const ip = String(request?.ip || request?.connection?.remoteAddress || '')
    await this.prisma.operationLog.create({ data: { operator, action, target, ip } })
  }
}
