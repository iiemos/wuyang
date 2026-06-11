import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { PublicService } from './public.service'

@Controller()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('home')
  home() {
    return this.publicService.home()
  }

  @Get('categories')
  categories() {
    return this.publicService.categories()
  }

  @Get('listings')
  listings(@Query() query: Record<string, unknown>) {
    return this.publicService.listings(query)
  }

  @Get('listings/:id/preview')
  preview(@Param('id') id: string, @Query('token') token: string) {
    return this.publicService.preview(id, String(token || ''))
  }

  @Get('listings/:id')
  detail(@Param('id') id: string) {
    return this.publicService.detail(id)
  }

  @Post('listings')
  create(@Body() body: Record<string, unknown>) {
    return this.publicService.createListing(body || {})
  }

  @Get('profile')
  profile() {
    return this.publicService.profile()
  }

  @Get('profile/publications')
  publications() {
    return this.publicService.publications()
  }

  @Get('profile/favorites')
  favorites() {
    return this.publicService.favorites()
  }

  @Get('profile/views')
  views() {
    return this.publicService.views()
  }

  @Get('profile/applications')
  applications() {
    return this.publicService.applications()
  }

  @Get('profile/reports')
  reports() {
    return this.publicService.reports()
  }

  @Post('favorites/:id')
  toggleFavorite(@Param('id') id: string) {
    return this.publicService.toggleFavorite(id)
  }

  @Post('applications/:id')
  apply(@Param('id') id: string) {
    return this.publicService.apply(id)
  }

  @Get('messages')
  messages() {
    return this.publicService.messages()
  }

  @Post('reports')
  createReport(@Body() body: Record<string, unknown>) {
    return this.publicService.createReport(body || {})
  }
}
