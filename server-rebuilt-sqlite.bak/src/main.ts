import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({ origin: true, credentials: true })

  const uploadsDir = join(process.cwd(), 'uploads')
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true })
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' })

  const port = Number(process.env.PORT || 3000)
  await app.listen(port)
  console.log(`qingning server listening on http://127.0.0.1:${port}/api`)
}

bootstrap()
