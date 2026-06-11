import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { admin?: any }>()
    const token = this.getToken(request)
    if (!token) throw new UnauthorizedException('未登录')

    try {
      const payload = this.jwt.verify(token)

      // 验证用户是否真实存在且处于活跃状态
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true }
                  }
                }
              }
            }
          }
        }
      })

      if (!user) throw new UnauthorizedException('用户不存在')
      if (user.status !== 'active') throw new UnauthorizedException('用户账号已禁用')

      // 更新 payload 中的权限信息（防止过期 token 导致权限不匹配）
      const roles = user.roles.map(item => item.role.code)
      const permissions = [...new Set(user.roles.flatMap(item => item.role.permissions.map(entry => entry.permission.code)))]

      request.admin = {
        sub: user.id,
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        roles,
        permissions
      }
      return true
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error
      throw new UnauthorizedException('登录已失效')
    }
  }

  private getToken(request: Request) {
    const authorization = request.headers.authorization || ''
    const [type, token] = authorization.split(' ')
    return type === 'Bearer' ? token : ''
  }
}
