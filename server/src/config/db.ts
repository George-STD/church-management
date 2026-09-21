import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

export const prisma = new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const supabase = (config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
  : null;
