import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

export const RequirePermission = Reflector.createDecorator<string | string[]>()

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get(RequirePermission, context.getHandler())
    const request = context.switchToHttp().getRequest<Request & { admin?: any }>()

    if (!permissions) return true

    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions]
    const userPermissions = (request.admin?.permissions || []) as string[]

    const hasPermission = requiredPermissions.some(perm => userPermissions.includes(perm))
    if (!hasPermission) {
      throw new ForbiddenException(`权限不足，需要以下权限之一: ${requiredPermissions.join(', ')}`)
    }

    return true
  }
}
