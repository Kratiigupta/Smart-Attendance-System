import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  ACCESS_TOKEN_SECRET: z.string().min(16),
  REFRESH_TOKEN_SECRET: z.string().min(16),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
