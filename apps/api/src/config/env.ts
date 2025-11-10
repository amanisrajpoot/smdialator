import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/omni_scheduler"),
  REDIS_URL: z.string().default("redis://localhost:6379/0"),
  JWT_SECRET: z.string().min(16).default("development-secret-change-me"),
  JWT_EXPIRATION: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRATION: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
  WEB_URL: z.string().default("http://localhost:3000"),
  BULLMQ_PREFIX: z.string().default("omni-scheduler"),
  JOB_CONCURRENCY: z.coerce.number().default(5),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_VERTEX_PROJECT_ID: z.string().optional(),
  N8N_BASE_URL: z.string().optional(),
  N8N_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  /* eslint-disable no-console */
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
