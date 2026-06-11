import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { static as serveStatic } from 'express'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpErrorFilter } from './shared/http-error.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const config = app.get(ConfigService)
  const origins = config.get<string>('CORS_ORIGIN', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }))
  const uploadDir = resolve(process.cwd(), 'uploads')
  mkdirSync(uploadDir, { recursive: true })
  app.use('/uploads', serveStatic(uploadDir))
  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true
  })
  app.useGlobalFilters(new HttpErrorFilter())

  const port = config.get<number>('PORT', 3000)
  await app.listen(port)
  Logger.log(`qingning-server listening on ${port}`, 'Bootstrap')
}

void bootstrap()
