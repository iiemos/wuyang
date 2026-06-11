import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AdminModule } from './modules/admin/admin.module'
import { AuthModule } from './modules/auth/auth.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { PublicModule } from './modules/public/public.module'
import { validateEnv } from './shared/env'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'server/.env'],
      validate: validateEnv
    }),
    PrismaModule,
    AuthModule,
    PublicModule,
    AdminModule
  ]
})
export class AppModule {}
