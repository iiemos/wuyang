import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { AdminAuthGuard } from '../auth/admin-auth.guard'
import { AdminContentService } from './content.service'

// 注意：本控制器包含 /admin/:resource 通配路由，必须在 AdminModule 中最后注册，
// 静态路由（categories/featured/content/...）定义在 :resource 路由之前。
@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminContentController {
  constructor(private readonly contentService: AdminContentService) {}

  // ---------- 静态路由 ----------

  @Get('featured')
  featured(@Query() query: Record<string, unknown>) {
    return this.contentService.featured(query)
  }

  @Get('categories')
  listCategories(@Query() query: Record<string, unknown>) {
    return this.contentService.listCategories(query)
  }

  @Post('categories')
  createCategory(@Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.createCategory(body || {}, request)
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.updateCategory(id, body || {}, request)
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string, @Req() request: any) {
    return this.contentService.deleteCategory(id, request)
  }

  @Put('content/:id/top')
  setTop(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.setTop(id, body || {}, request)
  }

  @Put('content/:id/recommend')
  setRecommend(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.setRecommend(id, body || {}, request)
  }

  @Post('content-batch/:resource/status')
  batchStatus(@Param('resource') resource: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.batchStatus(resource, body || {}, request)
  }

  @Post('content-batch/:resource/delete')
  batchDelete(@Param('resource') resource: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.batchDelete(resource, body || {}, request)
  }

  @Get('content-export/:resource')
  export(@Param('resource') resource: string, @Query() query: Record<string, unknown>) {
    return this.contentService.export(resource, query)
  }

  @Put('houses/:id/recommend')
  setHouseRecommend(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.setRecommend(id, body || {}, request)
  }

  // ---------- 资源通配路由 ----------

  @Get(':resource')
  list(@Param('resource') resource: string, @Query() query: Record<string, unknown>) {
    return this.contentService.list(resource, query)
  }

  @Post(':resource')
  create(@Param('resource') resource: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.create(resource, body || {}, request)
  }

  @Get(':resource/:id')
  detail(@Param('resource') resource: string, @Param('id') id: string) {
    return this.contentService.detail(resource, id)
  }

  @Put(':resource/:id/status')
  updateStatus(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() request: any
  ) {
    return this.contentService.updateStatus(resource, id, body || {}, request)
  }

  @Put(':resource/:id')
  update(@Param('resource') resource: string, @Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.contentService.update(resource, id, body || {}, request)
  }

  @Delete(':resource/:id')
  remove(@Param('resource') resource: string, @Param('id') id: string, @Req() request: any) {
    return this.contentService.remove(resource, id, request)
  }
}
