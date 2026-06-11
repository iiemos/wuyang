import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
const MAX_SIZE = 8 * 1024 * 1024

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const ext = extname(file.originalname || '').toLowerCase() || '.png'
          const name = `${Date.now()}-${Math.round(Math.random() * 1e8)}${ext}`
          callback(null, name)
        }
      }),
      limits: { fileSize: MAX_SIZE }
    })
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('未接收到上传文件')
    const ext = extname(file.originalname || file.filename || '').toLowerCase()
    if (ext && !ALLOWED_EXT.includes(ext)) {
      throw new BadRequestException(`不支持的文件类型：${ext}，仅支持 ${ALLOWED_EXT.join('/')}`)
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size
    }
  }
}
