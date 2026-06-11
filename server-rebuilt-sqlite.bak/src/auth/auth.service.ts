import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../common/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login(username: string, password: string) {
    if (!username || !password) throw new UnauthorizedException('请输入账号和密码')
    const admin = await this.prisma.adminUser.findUnique({ where: { username } })
    if (!admin) throw new UnauthorizedException('账号或密码错误')
    if (admin.status !== 'active') throw new UnauthorizedException('账号已被禁用，请联系超级管理员')
    const matched = await bcrypt.compare(password, admin.password)
    if (!matched) throw new UnauthorizedException('账号或密码错误')

    await this.prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
    await this.prisma.operationLog.create({
      data: { operator: admin.nickname || admin.username, action: '登录后台', target: admin.username }
    })

    const token = await this.jwt.signAsync({ sub: admin.id, username: admin.username })
    return { token, admin: await this.profile(admin.id) }
  }

  async profile(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
    })
    if (!admin) throw new UnauthorizedException('账号不存在')

    const permissions = new Set<string>()
    const roles = admin.roles.map((link) => {
      for (const rp of link.role.permissions) permissions.add(rp.permission.code)
      return { id: link.role.id, code: link.role.code, name: link.role.name }
    })

    return {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname || admin.username,
      phone: admin.phone,
      email: admin.email,
      status: admin.status,
      roles,
      permissions: [...permissions],
      lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null
    }
  }
}
