import { Controller, Get, UseGuards } from '@nestjs/common'
import { AdminAuthGuard } from '../auth/admin-auth.guard'
import { AdminStatsService } from './stats.service'

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminStatsController {
  constructor(private readonly statsService: AdminStatsService) {}

  @Get('overview')
  overview() {
    return this.statsService.overview()
  }

  @Get('stats/dashboard')
  dashboard() {
    return this.statsService.dashboard()
  }

  @Get('stats/operation')
  operation() {
    return this.statsService.operation()
  }

  @Get('stats/revenue')
  revenue() {
    return this.statsService.revenue()
  }
}
