import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(24),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGIN: z.string().default(''),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().optional()
})

export function validateEnv(config: Record<string, unknown>) {
  return schema.parse(config)
}
