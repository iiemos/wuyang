import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../common/prisma.service'
import { OperationLogService } from '../common/operation-log.service'
import { SettingsService } from '../common/settings.service'
import { csvPayload, toPage } from '../common/utils'

@Injectable()
export class AdminSystemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: OperationLogService,
    private readonly settings: SettingsService
  ) {}

  // ============ 平台配置 ============

  getSettings() {
    return this.settings.getAll()
  }

  async updateSettings(body: Record<string, unknown>, request: any) {
    const result = await this.settings.update(body || {})
    await this.logs.record(request, '更新系统设置', Object.keys(body || {}).join(','))
    return result
  }

  // ============ 敏感词 ============

  async listSensitiveWords() {
    const rows = await this.prisma.sensitiveWord.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map((row) => ({ id: row.id, word: row.word, hitCount: row.hitCount, status: row.status }))
  }

  async addSensitiveWord(word: string, request: any) {
    const trimmed = String(word || '').trim()
    if (!trimmed) throw new BadRequestException('敏感词不能为空')
    const existing = await this.prisma.sensitiveWord.findUnique({ where: { word: trimmed } })
    if (existing) throw new BadRequestException('该敏感词已存在')
    const row = await this.prisma.sensitiveWord.create({ data: { word: trimmed } })
    await this.logs.record(request, '添加敏感词', trimmed)
    return { id: row.id, word: row.word, hitCount: row.hitCount, status: row.status }
  }

  async addSensitiveWords(words: unknown, request: any) {
    const list = (Array.isArray(words) ? words : [])
      .map((word) => String(word || '').trim())
      .filter(Boolean)
    if (!list.length) throw new BadRequestException('请输入敏感词')
    const unique = [...new Set(list)]
    const existing = await this.prisma.sensitiveWord.findMany({ where: { word: { in: unique } } })
    const existingSet = new Set(existing.map((row) => row.word))
    const fresh = unique.filter((word) => !existingSet.has(word))
    const created = []
    for (const word of fresh) {
      created.push(await this.prisma.sensitiveWord.create({ data: { word } }))
    }
    await this.logs.record(request, '批量添加敏感词', `${created.length} 个`)
    return created.map((row) => ({ id: row.id, word: row.word, hitCount: row.hitCount, status: row.status }))
  }

  async deleteSensitiveWord(id: string, request: any) {
    const existing = await this.prisma.sensitiveWord.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('敏感词不存在')
    await this.prisma.sensitiveWord.delete({ where: { id } })
    await this.logs.record(request, '删除敏感词', existing.word)
    return null
  }

  // ============ 公告 ============

  private serializeNotice(row: any) {
    return { id: row.id, title: row.title, content: row.content, status: row.status, createdAt: row.createdAt.toISOString() }
  }

  async listNotices() {
    const rows = await this.prisma.notice.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map((row) => this.serializeNotice(row))
  }

  async createNotice(body: Record<string, unknown>, request: any) {
    if (!body.title || !String(body.title).trim()) throw new BadRequestException('公告标题不能为空')
    const notice = await this.prisma.notice.create({
      data: { title: String(body.title), content: String(body.content || ''), status: String(body.status || 'enabled') }
    })
    await this.logs.record(request, '发布公告', notice.title)
    return this.serializeNotice(notice)
  }

  async updateNotice(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.notice.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('公告不存在')
    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = String(body.title)
    if (body.content !== undefined) data.content = String(body.content)
    if (body.status !== undefined) data.status = String(body.status)
    const notice = await this.prisma.notice.update({ where: { id }, data: data as any })
    await this.logs.record(request, '编辑公告', notice.title)
    return this.serializeNotice(notice)
  }

  async deleteNotice(id: string, request: any) {
    const existing = await this.prisma.notice.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('公告不存在')
    await this.prisma.notice.delete({ where: { id } })
    await this.logs.record(request, '删除公告', existing.title)
    return null
  }

  // ============ 角色与权限 ============

  private serializeRole(role: any) {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      permissions: (role.permissions || []).map((rp: any) => ({
        permissionId: rp.permissionId,
        permission: {
          id: rp.permission.id,
          code: rp.permission.code,
          name: rp.permission.name,
          description: rp.permission.description
        }
      }))
    }
  }

  async listRoles() {
    const rows = await this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { createdAt: 'asc' }
    })
    return rows.map((row) => this.serializeRole(row))
  }

  async createRole(body: Record<string, unknown>, request: any) {
    const code = String(body.code || '').trim()
    const name = String(body.name || '').trim()
    if (!code || !name) throw new BadRequestException('角色编码和名称不能为空')
    const existing = await this.prisma.role.findUnique({ where: { code } })
    if (existing) throw new BadRequestException('角色编码已存在')
    const role = await this.prisma.role.create({ data: { code, name, description: String(body.description || '') } })
    if (Array.isArray(body.permissions) && body.permissions.length) {
      await this.setRolePermissions(role.id, body.permissions.map(String))
    }
    await this.logs.record(request, '新建角色', name)
    return this.serializeRole(
      await this.prisma.role.findUnique({ where: { id: role.id }, include: { permissions: { include: { permission: true } } } })
    )
  }

  async updateRole(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.role.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('角色不存在')
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = String(body.name)
    if (body.description !== undefined) data.description = String(body.description)
    if (body.code !== undefined && String(body.code) !== existing.code) {
      const dup = await this.prisma.role.findUnique({ where: { code: String(body.code) } })
      if (dup) throw new BadRequestException('角色编码已存在')
      data.code = String(body.code)
    }
    await this.prisma.role.update({ where: { id }, data: data as any })
    if (Array.isArray(body.permissions)) {
      await this.setRolePermissions(id, body.permissions.map(String))
    }
    await this.logs.record(request, '编辑角色', String(body.name || existing.name))
    return this.serializeRole(
      await this.prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } })
    )
  }

  async deleteRole(id: string, request: any) {
    const existing = await this.prisma.role.findUnique({ where: { id }, include: { users: true } })
    if (!existing) throw new NotFoundException('角色不存在')
    if (existing.code === 'super_admin') throw new BadRequestException('超级管理员角色不可删除')
    if (existing.users.length) throw new BadRequestException('该角色下仍有管理员账号，请先解除绑定')
    await this.prisma.role.delete({ where: { id } })
    await this.logs.record(request, '删除角色', existing.name)
    return null
  }

  async listPermissions() {
    const rows = await this.prisma.permission.findMany({ orderBy: { code: 'asc' } })
    return rows.map((row) => ({ id: row.id, code: row.code, name: row.name, description: row.description }))
  }

  private async setRolePermissions(roleId: string, permissionIds: string[]) {
    await this.prisma.rolePermission.deleteMany({ where: { roleId } })
    const valid = await this.prisma.permission.findMany({ where: { id: { in: permissionIds } } })
    for (const permission of valid) {
      await this.prisma.rolePermission.create({ data: { roleId, permissionId: permission.id } })
    }
  }

  async updateRolePermissions(id: string, permissions: unknown, request: any) {
    const existing = await this.prisma.role.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('角色不存在')
    await this.setRolePermissions(id, (Array.isArray(permissions) ? permissions : []).map(String))
    await this.logs.record(request, '分配角色权限', existing.name)
    return this.serializeRole(
      await this.prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } })
    )
  }

  // ============ 管理员账号 ============

  private serializeAdminAccount(admin: any) {
    return {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname,
      phone: admin.phone,
      email: admin.email,
      status: admin.status,
      publishCount: 0,
      favoriteCount: 0,
      viewCount: 0,
      registeredAt: admin.createdAt.toISOString(),
      createdAt: admin.createdAt.toISOString(),
      lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
      roles: (admin.roles || []).map((link: any) => ({ id: link.role.id, name: link.role.name, code: link.role.code }))
    }
  }

  async listAdminAccounts(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = toPage(query, 20)
    const where: Record<string, unknown> = {}
    const keyword = String(query.keyword || '').trim()
    if (keyword) where.OR = [{ username: { contains: keyword } }, { nickname: { contains: keyword } }]
    const [total, rows] = await Promise.all([
      this.prisma.adminUser.count({ where: where as any }),
      this.prisma.adminUser.findMany({
        where: where as any,
        include: { roles: { include: { role: true } } },
        orderBy: { createdAt: 'asc' },
        skip,
        take
      })
    ])
    return { items: rows.map((row) => this.serializeAdminAccount(row)), total, page, pageSize }
  }

  async createAdminAccount(body: Record<string, unknown>, request: any) {
    const username = String(body.username || '').trim()
    const password = String(body.password || '')
    if (!username) throw new BadRequestException('账号不能为空')
    if (password.length < 6) throw new BadRequestException('密码长度至少 6 位')
    const existing = await this.prisma.adminUser.findUnique({ where: { username } })
    if (existing) throw new BadRequestException('账号已存在')

    const admin = await this.prisma.adminUser.create({
      data: {
        username,
        password: await bcrypt.hash(password, 10),
        nickname: String(body.nickname || username),
        phone: String(body.phone || ''),
        email: String(body.email || ''),
        status: String(body.status || 'active')
      }
    })
    await this.assignRoles(admin.id, body.roleIds)
    await this.logs.record(request, '新建管理员', username)
    return this.serializeAdminAccount(
      await this.prisma.adminUser.findUnique({ where: { id: admin.id }, include: { roles: { include: { role: true } } } })
    )
  }

  async updateAdminAccount(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.adminUser.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('管理员不存在')
    const data: Record<string, unknown> = {}
    if (body.nickname !== undefined) data.nickname = String(body.nickname)
    if (body.phone !== undefined) data.phone = String(body.phone)
    if (body.email !== undefined) data.email = String(body.email)
    if (body.status !== undefined) data.status = String(body.status)
    if (body.password) {
      const password = String(body.password)
      if (password.length < 6) throw new BadRequestException('密码长度至少 6 位')
      data.password = await bcrypt.hash(password, 10)
    }
    await this.prisma.adminUser.update({ where: { id }, data: data as any })
    if (body.roleIds !== undefined) await this.assignRoles(id, body.roleIds)
    await this.logs.record(request, '编辑管理员', existing.username)
    return this.serializeAdminAccount(
      await this.prisma.adminUser.findUnique({ where: { id }, include: { roles: { include: { role: true } } } })
    )
  }

  async deleteAdminAccount(id: string, request: any) {
    const existing = await this.prisma.adminUser.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('管理员不存在')
    if (existing.username === 'admin') throw new BadRequestException('内置超级管理员不可删除')
    if (request?.admin?.id === id) throw new BadRequestException('不能删除当前登录账号')
    await this.prisma.adminUser.delete({ where: { id } })
    await this.logs.record(request, '删除管理员', existing.username)
    return null
  }

  private async assignRoles(adminUserId: string, roleIds: unknown) {
    if (!Array.isArray(roleIds)) return
    await this.prisma.adminUserRole.deleteMany({ where: { adminUserId } })
    const valid = await this.prisma.role.findMany({ where: { id: { in: roleIds.map(String) } } })
    for (const role of valid) {
      await this.prisma.adminUserRole.create({ data: { adminUserId, roleId: role.id } })
    }
  }

  // ============ 操作日志 ============

  private buildLogWhere(query: Record<string, unknown>) {
    const where: Record<string, unknown> = {}
    const action = String(query.action || '')
    if (action) where.action = { contains: action }
    const keyword = String(query.keyword || '').trim()
    if (keyword) where.OR = [{ operator: { contains: keyword } }, { target: { contains: keyword } }, { action: { contains: keyword } }]
    return where
  }

  async listOperationLogs(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = toPage(query, 20)
    const where = this.buildLogWhere(query)
    const [total, rows] = await Promise.all([
      this.prisma.operationLog.count({ where: where as any }),
      this.prisma.operationLog.findMany({ where: where as any, orderBy: { createdAt: 'desc' }, skip, take })
    ])
    return {
      items: rows.map((row) => ({
        id: row.id,
        operator: row.operator,
        action: row.action,
        target: row.target,
        ip: row.ip,
        createdAt: row.createdAt.toISOString()
      })),
      total,
      page,
      pageSize
    }
  }

  async exportOperationLogs(query: Record<string, unknown>) {
    const rows = await this.prisma.operationLog.findMany({
      where: this.buildLogWhere(query) as any,
      orderBy: { createdAt: 'desc' },
      take: 5000
    })
    return csvPayload(
      `operation-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', '操作人', '操作类型', '对象', 'IP', '时间'],
      rows.map((row) => [row.id, row.operator, row.action, row.target, row.ip, row.createdAt.toISOString()])
    )
  }

  // ============ 菜单 ============

  private serializeMenu(menu: any) {
    return {
      id: menu.id,
      parentId: menu.parentId,
      title: menu.title,
      path: menu.path,
      component: menu.component,
      icon: menu.icon,
      permission: menu.permission,
      sortOrder: menu.sortOrder,
      status: menu.status
    }
  }

  async listMenus(query: Record<string, unknown>) {
    const includeDisabled = String(query.all || '') === 'true'
    const flat = String(query.flat || '') === 'true'
    const rows = await this.prisma.adminMenu.findMany({
      where: includeDisabled ? {} : { status: 'enabled' },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }]
    })
    const serialized = rows.map((row) => this.serializeMenu(row))
    if (flat) return serialized

    const byParent = new Map<string | null, any[]>()
    for (const menu of serialized) {
      const key = menu.parentId || null
      byParent.set(key, [...(byParent.get(key) || []), menu])
    }
    const attach = (menu: any): any => ({ ...menu, children: (byParent.get(menu.id) || []).map(attach) })
    return (byParent.get(null) || []).map(attach)
  }

  async createMenu(body: Record<string, unknown>, request: any) {
    const title = String(body.title || '').trim()
    const path = String(body.path || '').trim()
    if (!title || !path) throw new BadRequestException('菜单名称和路径不能为空')
    const menu = await this.prisma.adminMenu.create({
      data: {
        parentId: body.parentId ? String(body.parentId) : null,
        title,
        path,
        component: body.component ? String(body.component) : null,
        icon: body.icon ? String(body.icon) : null,
        permission: body.permission ? String(body.permission) : null,
        sortOrder: Number(body.sortOrder) || 0,
        status: String(body.status || 'enabled')
      }
    })
    await this.logs.record(request, '新增菜单', title)
    return this.serializeMenu(menu)
  }

  async updateMenu(id: string, body: Record<string, unknown>, request: any) {
    const existing = await this.prisma.adminMenu.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('菜单不存在')
    const data: Record<string, unknown> = {}
    if (body.parentId !== undefined) data.parentId = body.parentId ? String(body.parentId) : null
    if (body.title !== undefined) data.title = String(body.title)
    if (body.path !== undefined) data.path = String(body.path)
    if (body.component !== undefined) data.component = body.component ? String(body.component) : null
    if (body.icon !== undefined) data.icon = body.icon ? String(body.icon) : null
    if (body.permission !== undefined) data.permission = body.permission ? String(body.permission) : null
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0
    if (body.status !== undefined) data.status = String(body.status)
    const menu = await this.prisma.adminMenu.update({ where: { id }, data: data as any })
    await this.logs.record(request, '编辑菜单', menu.title)
    return this.serializeMenu(menu)
  }

  async deleteMenu(id: string, request: any) {
    const existing = await this.prisma.adminMenu.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('菜单不存在')
    const children = await this.prisma.adminMenu.count({ where: { parentId: id } })
    if (children) throw new BadRequestException('请先删除该菜单下的子菜单')
    await this.prisma.adminMenu.delete({ where: { id } })
    await this.logs.record(request, '删除菜单', existing.title)
    return null
  }
}
