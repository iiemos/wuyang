import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { z } from 'zod'
import { parseBody } from '../../shared/validation'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

@Controller('api/admin/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: unknown, @Req() request: Request) {
    const data = parseBody(loginSchema, body)
    return { data: await this.auth.login(data.username, data.password, request.ip) }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() request: Request & { admin?: unknown }) {
    return { data: request.admin }
  }
}
