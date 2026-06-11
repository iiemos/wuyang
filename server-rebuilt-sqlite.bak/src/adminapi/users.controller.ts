import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { AdminAuthGuard } from '../auth/admin-auth.guard'
import { AdminUsersService } from './users.service'

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get('users/export')
  export(@Query() query: Record<string, unknown>) {
    return this.usersService.export(query)
  }

  @Post('users/batch/status')
  batchStatus(@Body() body: Record<string, unknown>, @Req() request: any) {
    return this.usersService.batchStatus(body || {}, request)
  }

  @Get('users')
  list(@Query() query: Record<string, unknown>) {
    return this.usersService.list(query)
  }

  @Get('users/:id')
  detail(@Param('id') id: string) {
    return this.usersService.detail(id)
  }

  @Put('users/:id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status?: string }, @Req() request: any) {
    return this.usersService.updateStatus(id, String(body?.status || ''), request)
  }

  @Get('certifications')
  listCertifications(@Query() query: Record<string, unknown>) {
    return this.usersService.listCertifications(query)
  }

  @Put('certifications/:id')
  updateCertification(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.usersService.updateCertification(id, body || {}, request)
  }

  @Get('reports')
  listReports(@Query() query: Record<string, unknown>) {
    return this.usersService.listReports(query)
  }

  @Put('reports/:id')
  updateReport(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.usersService.updateReport(id, body || {}, request)
  }
}
