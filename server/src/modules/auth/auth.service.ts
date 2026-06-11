import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login(username: string, password: string, ip?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
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
    const ok = user?.passwordHash ? await compare(password, user.passwordHash) : false

    await this.prisma.loginLog.create({
      data: {
        account: username,
        ip,
        status: ok ? 'success' : 'failed'
      }
    })

    if (!user || !ok || user.status !== 'active') throw new UnauthorizedException('账号或密码错误')

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const roles = user.roles.map((item) => item.role.code)
    const permissions = [...new Set(user.roles.flatMap((item) => item.role.permissions.map((entry) => entry.permission.code)))]
    const token = await this.jwt.signAsync({
      sub: user.id,
      username: user.username,
      nickname: user.nickname,
      roles,
      permissions
    })

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        roles,
        permissions
      }
    }
  }
}
