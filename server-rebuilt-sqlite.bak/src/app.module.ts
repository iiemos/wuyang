import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PrismaService } from './common/prisma.service'
import { SettingsService } from './common/settings.service'
import { OperationLogService } from './common/operation-log.service'
import { EnvelopeInterceptor } from './common/envelope.interceptor'
import { AllExceptionsFilter } from './common/http-exception.filter'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { AdminAuthGuard } from './auth/admin-auth.guard'
import { PublicController } from './public/public.controller'
import { PublicService } from './public/public.service'
import { UploadsController } from './uploads/uploads.controller'
import { AdminUsersController } from './adminapi/users.controller'
import { AdminUsersService } from './adminapi/users.service'
import { AdminOperationController } from './adminapi/operation.controller'
import { AdminOperationService } from './adminapi/operation.service'
import { AdminSystemController } from './adminapi/system.controller'
import { AdminSystemService } from './adminapi/system.service'
import { AdminStatsController } from './adminapi/stats.controller'
import { AdminStatsService } from './adminapi/stats.service'
import { AdminContentController } from './adminapi/content.controller'
import { AdminContentService } from './adminapi/content.service'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'qingning-local-life-secret',
      signOptions: { expiresIn: '7d' }
    })
  ],
  // 注意控制器顺序：AdminContentController 含 /admin/:resource 通配路由，必须最后注册
  controllers: [
    AuthController,
    PublicController,
    UploadsController,
    AdminUsersController,
    AdminOperationController,
    AdminSystemController,
    AdminStatsController,
    AdminContentController
  ],
  providers: [
    PrismaService,
    SettingsService,
    OperationLogService,
    AuthService,
    AdminAuthGuard,
    PublicService,
    AdminUsersService,
    AdminOperationService,
    AdminSystemService,
    AdminStatsService,
    AdminContentService,
    { provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter }
  ]
})
export class AppModule {}
