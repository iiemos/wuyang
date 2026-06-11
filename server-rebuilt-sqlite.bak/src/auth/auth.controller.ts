import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AdminAuthGuard } from './admin-auth.guard'

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { username?: string; password?: string }) {
    return this.authService.login(String(body.username || ''), String(body.password || ''))
  }

  @Get('profile')
  @UseGuards(AdminAuthGuard)
  profile(@Req() request: any) {
    return this.authService.profile(request.admin.id)
  }
}
