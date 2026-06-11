import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

// 统一错误响应：{ error: message }
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const body = exception.getResponse()
      if (typeof body === 'string') {
        message = body
      } else if (body && typeof body === 'object') {
        const anyBody = body as Record<string, unknown>
        // 注意：Nest 内置异常的 body 形如 { statusCode, message, error: 'Bad Request' }，
        // 自定义中文消息在 message 字段，必须优先取 message
        const rawMessage = Array.isArray(anyBody.message) ? anyBody.message.join('；') : anyBody.message
        message = String(rawMessage || anyBody.error || exception.message)
      }
    } else if (exception instanceof Error) {
      message = exception.message || message
      console.error('[unhandled]', exception)
    }

    response.status(status).json({ error: message })
  }
}
