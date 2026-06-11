import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../common/prisma.service'

export interface AdminContext {
  id: string
  username: string
  nickname: string
  permissions: string[]
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const header = String(request.headers.authorization || '')
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) throw new UnauthorizedException('未登录或登录已过期')

    let payload: { sub: string }
    try {
      payload = await this.jwt.verifyAsync(token)
    } catch {
      throw new UnauthorizedException('未登录或登录已过期')
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
    })
    if (!admin || admin.status !== 'active') throw new UnauthorizedException('账号不存在或已被禁用')

    const permissions = new Set<string>()
    for (const link of admin.roles) {
      for (const rp of link.role.permissions) permissions.add(rp.permission.code)
    }

    request.admin = {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname || admin.username,
      permissions: [...permissions]
    } satisfies AdminContext
    return true
  }
}
