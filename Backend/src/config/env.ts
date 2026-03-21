import { config as dotenvConfig } from 'dotenv'
import { z } from 'zod'

// Load .env file
dotenvConfig()

// Environment schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Server
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // CORS
  CORS_ORIGINS: z.string().transform(val => val.split(',')),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  // Audit log
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(2555), // 7 years

  // Registration keys
  REGISTRATION_KEY_EXPIRES_HOURS: z.coerce.number().default(72),

  // WebSocket
  WS_HEARTBEAT_INTERVAL_MS: z.coerce.number().default(30000),
})

// Parse and validate
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data

// Type for use elsewhere
export type Config = z.infer<typeof envSchema>
