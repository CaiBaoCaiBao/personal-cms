import { config } from 'dotenv';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

config();              // .env
config({ path: '.env.development', override: true }); // 开发环境覆盖
// config({ path: '.env.production', override: true }); // 生产环境覆盖
config({ path: '.env.local', override: true }); // 本地环境覆盖

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
