import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminService } from './admin.service'

type AdminRequest = Request & {
  admin?: {
    nickname?: string
    username?: string
  }
}

@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('overview')
  async overview() {
    return { data: await this.service.overview() }
  }

  @Get('audits')
  async audits() {
    return { data: await this.service.audits() }
  }

  @Get('stats/dashboard')
  async dashboard() {
    return { data: await this.service.dashboard() }
  }

  @Get('stats/publication')
  async publication() {
    return { data: await this.service.publicationStats() }
  }

  @Get('stats/user-activity')
  async userActivity() {
    return { data: await this.service.userActivityStats() }
  }

  @Get('stats/operation')
  async operationStats() {
    return { data: await this.service.operationStats() }
  }

  @Get('stats/revenue')
  async revenue() {
    return { data: await this.service.revenueStats() }
  }

  @Get('recruitments')
  async recruitments(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listContent('recruitments', query) }
  }

  @Get('recruitments/:id')
  async recruitment(@Param('id') id: string) {
    return { data: await this.service.contentDetail('recruitments', id) }
  }

  @Post('recruitments')
  async createRecruitment(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createContent('recruitments', body, this.operator(req), req.ip) }
  }

  @Put('recruitments/:id')
  async updateRecruitment(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContent('recruitments', id, body, this.operator(req), req.ip) }
  }

  @Put('recruitments/:id/status')
  async updateRecruitmentStatus(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContentStatus('recruitments', id, body, this.operator(req), req.ip) }
  }

  @Put('recruitments/:id/top')
  async updateRecruitmentTop(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateTop(id, body, this.operator(req), req.ip) }
  }

  @Post('recruitment-blacklist')
  async recruitmentBlacklist(@Body() body: any, @Req() req: AdminRequest) {
    return { data: await this.service.addRecruitmentBlacklist(body, this.operator(req), req.ip) }
  }

  @Delete('recruitments/:id')
  async deleteRecruitment(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteContent('recruitments', id, this.operator(req), req.ip) }
  }

  @Get('companies')
  async companies() {
    return { data: await this.service.companies() }
  }

  @Get('houses')
  async houses(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listContent('houses', query) }
  }

  @Get('houses/:id')
  async house(@Param('id') id: string) {
    return { data: await this.service.contentDetail('houses', id) }
  }

  @Post('houses')
  async createHouse(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createContent('houses', body, this.operator(req), req.ip) }
  }

  @Put('houses/:id')
  async updateHouse(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContent('houses', id, body, this.operator(req), req.ip) }
  }

  @Put('houses/:id/status')
  async updateHouseStatus(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContentStatus('houses', id, body, this.operator(req), req.ip) }
  }

  @Put('houses/:id/recommend')
  async updateHouseRecommend(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateRecommend(id, body, this.operator(req), req.ip) }
  }

  @Get('agencies')
  async agencies() {
    return { data: await this.service.agencies() }
  }

  @Delete('houses/:id')
  async deleteHouse(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteContent('houses', id, this.operator(req), req.ip) }
  }

  @Get('conveniences')
  async conveniences(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listContent('conveniences', query) }
  }

  @Get('convenience')
  async convenience(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listContent('conveniences', query) }
  }

  @Post('conveniences')
  async createConvenience(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createContent('conveniences', body, this.operator(req), req.ip) }
  }

  @Put('conveniences/:id')
  async updateConvenience(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContent('conveniences', id, body, this.operator(req), req.ip) }
  }

  @Put('conveniences/:id/status')
  async updateConvenienceStatus(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContentStatus('conveniences', id, body, this.operator(req), req.ip) }
  }

  @Put('convenience/:id/status')
  async updateConvenienceStatusAlias(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContentStatus('conveniences', id, body, this.operator(req), req.ip) }
  }

  @Delete('conveniences/:id')
  async deleteConvenience(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteContent('conveniences', id, this.operator(req), req.ip) }
  }

  @Get('used-goods')
  async usedGoods(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listContent('used-goods', query) }
  }

  @Get('used-goods/:id')
  async usedGood(@Param('id') id: string) {
    return { data: await this.service.contentDetail('used-goods', id) }
  }

  @Post('used-goods')
  async createUsedGood(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createContent('used-goods', body, this.operator(req), req.ip) }
  }

  @Put('used-goods/:id')
  async updateUsedGood(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContent('used-goods', id, body, this.operator(req), req.ip) }
  }

  @Put('used-goods/:id/status')
  async updateUsedGoodStatus(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContentStatus('used-goods', id, body, this.operator(req), req.ip) }
  }

  @Delete('used-goods/:id')
  async deleteUsedGood(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteContent('used-goods', id, this.operator(req), req.ip) }
  }

  @Get('shops')
  async shops(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listContent('shops', query) }
  }

  @Get('shops/:id')
  async shop(@Param('id') id: string) {
    return { data: await this.service.contentDetail('shops', id) }
  }

  @Post('shops')
  async createShop(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createContent('shops', body, this.operator(req), req.ip) }
  }

  @Put('shops/:id')
  async updateShop(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContent('shops', id, body, this.operator(req), req.ip) }
  }

  @Put('shops/:id/status')
  async updateShopStatus(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContentStatus('shops', id, body, this.operator(req), req.ip) }
  }

  @Delete('shops/:id')
  async deleteShop(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteContent('shops', id, this.operator(req), req.ip) }
  }

  @Get('articles')
  async articles(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listContent('articles', query) }
  }

  @Get('articles/:id')
  async article(@Param('id') id: string) {
    return { data: await this.service.contentDetail('articles', id) }
  }

  @Post('articles')
  async createArticle(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createArticle(body, this.operator(req), req.ip) }
  }

  @Put('articles/:id')
  async updateArticle(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateArticle(id, body, this.operator(req), req.ip) }
  }

  @Put('articles/:id/status')
  async updateArticleStatus(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateContentStatus('articles', id, body, this.operator(req), req.ip) }
  }

  @Delete('articles/:id')
  async deleteArticle(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteArticle(id, this.operator(req), req.ip) }
  }

  @Get('content-export/:resource')
  async exportContent(@Param('resource') resource: any, @Query() query: Record<string, unknown>) {
    return { data: await this.service.exportContent(resource, query) }
  }

  @Post('content-batch/:resource/status')
  async batchContentStatus(
    @Param('resource') resource: any,
    @Body() body: unknown,
    @Req() req: AdminRequest
  ) {
    return { data: await this.service.batchContentStatus(resource, body, this.operator(req), req.ip) }
  }

  @Post('content-batch/:resource/delete')
  async batchDeleteContent(
    @Param('resource') resource: any,
    @Body() body: unknown,
    @Req() req: AdminRequest
  ) {
    return { data: await this.service.batchDeleteContent(resource, body, this.operator(req), req.ip) }
  }

  @Put('content/:id/top')
  async updateContentTop(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateTop(id, body, this.operator(req), req.ip) }
  }

  @Put('content/:id/recommend')
  async updateContentRecommend(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateRecommend(id, body, this.operator(req), req.ip) }
  }

  @Get('featured')
  async featured(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listFeatured(query) }
  }

  @Get('categories')
  async categories(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listCategories(query) }
  }

  @Post('categories')
  async createCategory(@Body() body: unknown) {
    return { data: await this.service.createCategory(body) }
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: unknown) {
    return { data: await this.service.updateCategory(id, body) }
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return { data: await this.service.deleteCategory(id) }
  }

  @Get('shop-categories')
  async shopCategories() {
    return { data: await this.service.shopCategories() }
  }

  @Get('shop-orders')
  async shopOrders() {
    return { data: await this.service.topOrders() }
  }

  @Get('article-categories')
  async articleCategories() {
    return { data: await this.service.articleCategories() }
  }

  @Get('ad-positions')
  async adPositions() {
    return { data: await this.service.adPositions() }
  }

  @Post('ad-positions')
  async createAdPosition(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createAdPosition(body, this.operator(req), req.ip) }
  }

  @Put('ad-positions/:id')
  async updateAdPosition(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateAdPosition(id, body, this.operator(req), req.ip) }
  }

  @Delete('ad-positions/:id')
  async deleteAdPosition(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteAdPosition(id, this.operator(req), req.ip) }
  }

  @Post('ad-positions/:id/ads')
  async addAd(@Param('id') id: string, @Body() body: any, @Req() req: AdminRequest) {
    return { data: await this.service.addAd(id, body, this.operator(req), req.ip) }
  }

  @Put('ads/:id')
  async updateAd(@Param('id') id: string, @Body() body: any, @Req() req: AdminRequest) {
    return { data: await this.service.updateAd(id, body, this.operator(req), req.ip) }
  }

  @Delete('ads/:id')
  async deleteAd(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteAd(id, this.operator(req), req.ip) }
  }

  @Get('ads/:id/stats')
  async adStats(@Param('id') id: string) {
    return { data: await this.service.adStats(id) }
  }

  @Get('top-orders')
  async topOrders() {
    return { data: await this.service.topOrders() }
  }

  @Get('users')
  async users(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listUsers(query) }
  }

  @Get('users/export')
  async exportUsers(@Query() query: Record<string, unknown>) {
    return { data: await this.service.exportUsers(query) }
  }

  @Get('users/:id')
  async user(@Param('id') id: string) {
    return { data: await this.service.user(id) }
  }

  @Put('users/:id/status')
  async updateUserStatus(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateUserStatus(id, body, this.operator(req), req.ip) }
  }

  @Post('users/batch/status')
  async batchUserStatus(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.batchUserStatus(body, this.operator(req), req.ip) }
  }

  @Get('users/:id/roles')
  async userRoles(@Param('id') id: string) {
    return { data: await this.service.userRoles(id) }
  }

  @Put('users/:id/roles')
  async updateUserRoles(@Param('id') id: string, @Body() body: any) {
    return { data: await this.service.updateUserRoles(id, body) }
  }

  @Get('certifications')
  async certifications(@Query() query: Record<string, unknown>) {
    return { data: await this.service.certifications(query) }
  }

  @Put('certifications/:id')
  async updateCertification(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateCertification(id, body, this.operator(req), req.ip) }
  }

  @Get('reports')
  async reports(@Query() query: Record<string, unknown>) {
    return { data: await this.service.reports(query) }
  }

  @Put('reports/:id')
  async updateReport(@Param('id') id: string, @Body() body: any, @Req() req: AdminRequest) {
    return { data: await this.service.updateReport(id, body, this.operator(req), req.ip) }
  }

  @Get('roles')
  async roles() {
    return { data: await this.service.roles() }
  }

  @Post('roles')
  async createRole(@Body() body: unknown) {
    return { data: await this.service.createRole(body) }
  }

  @Put('roles/:id')
  async updateRole(@Param('id') id: string, @Body() body: unknown) {
    return { data: await this.service.updateRole(id, body) }
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    return { data: await this.service.deleteRole(id) }
  }

  @Get('permissions')
  async permissions() {
    return { data: await this.service.permissions() }
  }

  @Put('roles/:id/permissions')
  async updateRolePermissions(@Param('id') id: string, @Body() body: any) {
    return { data: await this.service.updateRolePermissions(id, body) }
  }

  @Get('admin-accounts')
  async adminAccounts(@Query() query: Record<string, unknown>) {
    return { data: await this.service.adminAccounts(query) }
  }

  @Post('admin-accounts')
  async createAdminAccount(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createAdminAccount(body, this.operator(req), req.ip) }
  }

  @Put('admin-accounts/:id')
  async updateAdminAccount(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateAdminAccount(id, body, this.operator(req), req.ip) }
  }

  @Delete('admin-accounts/:id')
  async deleteAdminAccount(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteAdminAccount(id, this.operator(req), req.ip) }
  }

  @Get('settings')
  async settings() {
    return { data: await this.service.settings() }
  }

  @Put('settings')
  async updateSettings(@Body() body: any, @Req() req: AdminRequest) {
    return { data: await this.service.updateSettings(body, this.operator(req), req.ip) }
  }

  @Get('sensitive-words')
  async sensitiveWords() {
    return { data: await this.service.sensitiveWords() }
  }

  @Post('sensitive-words')
  async addSensitiveWord(@Body() body: any) {
    return { data: await this.service.addSensitiveWord(body) }
  }

  @Post('sensitive-words/batch')
  async addSensitiveWords(@Body() body: any) {
    return { data: await this.service.addSensitiveWords(body) }
  }

  @Delete('sensitive-words/:id')
  async deleteSensitiveWord(@Param('id') id: string) {
    return { data: await this.service.deleteSensitiveWord(id) }
  }

  @Get('notices')
  async notices() {
    return { data: await this.service.notices() }
  }

  @Post('notices')
  async createNotice(@Body() body: any, @Req() req: AdminRequest) {
    return { data: await this.service.createNotice(body, this.operator(req), req.ip) }
  }

  @Put('notices/:id')
  async updateNotice(@Param('id') id: string, @Body() body: any, @Req() req: AdminRequest) {
    return { data: await this.service.updateNotice(id, body, this.operator(req), req.ip) }
  }

  @Delete('notices/:id')
  async deleteNotice(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteNotice(id, this.operator(req), req.ip) }
  }

  @Get('operation-logs')
  async operationLogs(@Query() query: Record<string, unknown>) {
    return { data: await this.service.operationLogs(query) }
  }

  @Get('operation-logs/export')
  async exportOperationLogs(@Query() query: Record<string, unknown>) {
    return { data: await this.service.exportOperationLogs(query) }
  }

  @Get('login-logs')
  async loginLogs() {
    return { data: await this.service.loginLogs() }
  }

  @Get('menus')
  async menus(@Query() query: Record<string, unknown>) {
    return { data: await this.service.menus(query) }
  }

  @Post('menus')
  async createMenu(@Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.createMenu(body, this.operator(req), req.ip) }
  }

  @Put('menus/:id')
  async updateMenu(@Param('id') id: string, @Body() body: unknown, @Req() req: AdminRequest) {
    return { data: await this.service.updateMenu(id, body, this.operator(req), req.ip) }
  }

  @Delete('menus/:id')
  async deleteMenu(@Param('id') id: string, @Req() req: AdminRequest) {
    return { data: await this.service.deleteMenu(id, this.operator(req), req.ip) }
  }

  private operator(req: AdminRequest) {
    return req.admin?.nickname || req.admin?.username || '管理员'
  }
}
