import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';
import { config } from 'dotenv';

config();              // .env
config({ path: '.env.development', override: true }); // 开发环境覆盖
// config({ path: '.env.production', override: true }); // 生产环境覆盖
config({ path: '.env.local', override: true }); // 本地环境覆盖

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});
