import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AdminAuthGuard } from '../auth/admin-auth.guard'
import { AdminOperationService } from './operation.service'

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminOperationController {
  constructor(private readonly operationService: AdminOperationService) {}

  @Get('ad-positions')
  listPositions() {
    return this.operationService.listPositions()
  }

  @Post('ad-positions')
  createPosition(@Body() body: Record<string, unknown>, @Req() request: any) {
    return this.operationService.createPosition(body || {}, request)
  }

  @Put('ad-positions/:id')
  updatePosition(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.operationService.updatePosition(id, body || {}, request)
  }

  @Delete('ad-positions/:id')
  deletePosition(@Param('id') id: string, @Req() request: any) {
    return this.operationService.deletePosition(id, request)
  }

  @Post('ad-positions/:id/ads')
  addAd(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.operationService.addAd(id, body || {}, request)
  }

  @Put('ads/:id')
  updateAd(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: any) {
    return this.operationService.updateAd(id, body || {}, request)
  }

  @Delete('ads/:id')
  deleteAd(@Param('id') id: string, @Req() request: any) {
    return this.operationService.deleteAd(id, request)
  }

  @Get('top-orders')
  listTopOrders() {
    return this.operationService.listTopOrders()
  }
}
