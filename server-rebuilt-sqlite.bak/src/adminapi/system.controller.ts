import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { AdminAuthGuard } from '../auth/admin-auth.guard'
import { AdminSystemService } from './system.service'

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminSystemController {
  constructor(private readonly systemService: AdminSystemService) {}

  @Get('settings')
  getSettings() {
    return this.systemService.getSettings()
  }

  @Put('settings')
  updateSettings(@Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.updateSettings(body || {}, request)
  }

  @Get('sensitive-words')
  listSensitiveWords() {
    return this.systemService.listSensitiveWords()
  }

  @Post('sensitive-words/batch')
  addSensitiveWords(@Body() body: { words?: string[] }, @Req() request: any) {
    return this.systemService.addSensitiveWords(body?.words, request)
  }

  @Post('sensitive-words')
  addSensitiveWord(@Body() body: { word?: string }, @Req() request: any) {
    return this.systemService.addSensitiveWord(String(body?.word || ''), request)
  }

  @Delete('sensitive-words/:id')
  deleteSensitiveWord(@Param('id') id: string, @Req() request: any) {
    return this.systemService.deleteSensitiveWord(id, request)
  }

  @Get('notices')
  listNotices() {
    return this.systemService.listNotices()
  }

  @Post('notices')
  createNotice(@Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.createNotice(body || {}, request)
  }

  @Put('notices/:id')
  updateNotice(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.updateNotice(id, body || {}, request)
  }

  @Delete('notices/:id')
  deleteNotice(@Param('id') id: string, @Req() request: any) {
    return this.systemService.deleteNotice(id, request)
  }

  @Get('roles')
  listRoles() {
    return this.systemService.listRoles()
  }

  @Post('roles')
  createRole(@Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.createRole(body || {}, request)
  }

  @Put('roles/:id/permissions')
  updateRolePermissions(@Param('id') id: string, @Body() body: { permissions?: string[] }, @Req() request: any) {
    return this.systemService.updateRolePermissions(id, body?.permissions, request)
  }

  @Put('roles/:id')
  updateRole(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.updateRole(id, body || {}, request)
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string, @Req() request: any) {
    return this.systemService.deleteRole(id, request)
  }

  @Get('permissions')
  listPermissions() {
    return this.systemService.listPermissions()
  }

  @Get('admin-accounts')
  listAdminAccounts(@Query() query: Record<string, unknown>) {
    return this.systemService.listAdminAccounts(query)
  }

  @Post('admin-accounts')
  createAdminAccount(@Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.createAdminAccount(body || {}, request)
  }

  @Put('admin-accounts/:id')
  updateAdminAccount(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.updateAdminAccount(id, body || {}, request)
  }

  @Delete('admin-accounts/:id')
  deleteAdminAccount(@Param('id') id: string, @Req() request: any) {
    return this.systemService.deleteAdminAccount(id, request)
  }

  @Get('operation-logs/export')
  exportOperationLogs(@Query() query: Record<string, unknown>) {
    return this.systemService.exportOperationLogs(query)
  }

  @Get('operation-logs')
  listOperationLogs(@Query() query: Record<string, unknown>) {
    return this.systemService.listOperationLogs(query)
  }

  @Get('menus')
  listMenus(@Query() query: Record<string, unknown>) {
    return this.systemService.listMenus(query)
  }

  @Post('menus')
  createMenu(@Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.createMenu(body || {}, request)
  }

  @Put('menus/:id')
  updateMenu(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.systemService.updateMenu(id, body || {}, request)
  }

  @Delete('menus/:id')
  deleteMenu(@Param('id') id: string, @Req() request: any) {
    return this.systemService.deleteMenu(id, request)
  }
}
