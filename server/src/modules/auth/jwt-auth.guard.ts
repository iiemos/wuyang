import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { admin?: unknown }>()
    const token = this.getToken(request)
    if (!token) throw new UnauthorizedException('未登录')

    try {
      request.admin = this.jwt.verify(token)
      return true
    } catch {
      throw new UnauthorizedException('登录已失效')
    }
  }

  private getToken(request: Request) {
    const authorization = request.headers.authorization || ''
    const [type, token] = authorization.split(' ')
    return type === 'Bearer' ? token : ''
  }
}
