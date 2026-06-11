import { BadRequestException, Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { mkdirSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { diskStorage } from 'multer'
import { PublicService } from './public.service'

const uploadStorage = diskStorage({
  destination: (_req, _file, callback) => {
    const dir = resolve(process.cwd(), 'uploads')
    mkdirSync(dir, { recursive: true })
    callback(null, dir)
  },
  filename: (_req, file, callback) => {
    const suffix = extname(file.originalname).toLowerCase() || '.jpg'
    callback(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${suffix}`)
  }
})

@Controller('api')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('health')
  health() {
    return this.service.health()
  }

  @Get('categories')
  async categories() {
    return { data: await this.service.categories() }
  }

  @Get('home')
  async home() {
    return { data: await this.service.home() }
  }

  @Get('listings')
  async listings(@Query() query: Record<string, unknown>) {
    return { data: await this.service.listings(query) }
  }

  @Get('listings/:id/preview')
  async listingPreview(@Param('id') id: string, @Query('token') token?: string) {
    return { data: await this.service.listingPreview(id, token) }
  }

  @Get('listings/:id')
  async listing(@Param('id') id: string) {
    return { data: await this.service.listing(id) }
  }

  @Post('listings')
  async createListing(@Body() body: unknown) {
    return { data: await this.service.createListing(body) }
  }

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', {
    storage: uploadStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        callback(new BadRequestException('只允许上传图片'), false)
        return
      }
      callback(null, true)
    }
  }))
  upload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('请选择图片')
    return { data: { url: `/uploads/${file.filename}`, filename: file.filename } }
  }

  @Get('messages')
  async messages() {
    return { data: await this.service.messages() }
  }

  @Get('profile')
  async profile() {
    return { data: await this.service.profile() }
  }

  @Get('profile/publications')
  async profilePublications() {
    return { data: await this.service.profilePublications() }
  }

  @Get('profile/favorites')
  async profileFavorites() {
    return { data: await this.service.profileFavorites() }
  }

  @Get('profile/views')
  async profileViews() {
    return { data: await this.service.profileViews() }
  }

  @Get('profile/applications')
  async profileApplications() {
    return { data: await this.service.profileApplications() }
  }

  @Get('profile/reports')
  async profileReports() {
    return { data: await this.service.profileReports() }
  }

  @Post('favorites/:id')
  async toggleFavorite(@Param('id') id: string) {
    return { data: await this.service.toggleFavorite(id) }
  }

  @Post('applications/:id')
  async applyJob(@Param('id') id: string) {
    return { data: await this.service.applyJob(id) }
  }

  @Post('reports')
  async createReport(@Body() body: unknown) {
    return { data: await this.service.createReport(body) }
  }
}
