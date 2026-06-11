import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name)

  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const body = error instanceof HttpException ? error.getResponse() : null
    const message = typeof body === 'object' && body && 'message' in body ? body.message : 'Internal Server Error'

    if (status >= 500) this.logger.error(error)

    response.status(status).json({
      error: Array.isArray(message) ? message[0] : message
    })
  }
}
