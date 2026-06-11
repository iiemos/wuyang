import { BadRequestException } from '@nestjs/common'
import { ZodSchema } from 'zod'

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) throw new BadRequestException(result.error.issues[0]?.message || '参数错误')
  return result.data
}
