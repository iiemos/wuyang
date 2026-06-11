import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'
import { MulterError } from 'multer'

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name)

  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (error instanceof MulterError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        error: error.code === 'LIMIT_FILE_SIZE' ? '图片大小不能超过 5MB' : `图片上传失败：${error.message}`
      })
      return
    }

    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const body = error instanceof HttpException ? error.getResponse() : null
    let message = typeof body === 'object' && body && 'message' in body ? body.message : 'Internal Server Error'
    // Nest 会把 multer 的超限错误转成 413 PayloadTooLarge（英文），统一替换为中文提示
    if (status === HttpStatus.PAYLOAD_TOO_LARGE) message = '图片大小不能超过 5MB'

    if (status >= 500) this.logger.error(error)

    response.status(status).json({
      error: Array.isArray(message) ? message[0] : message
    })
  }
}
