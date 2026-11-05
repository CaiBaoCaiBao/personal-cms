import "server-only";

import { serverEnvSchema } from "@/lib/schema/env/server-env.schema";
import { deepClone, deepFreeze } from "@/lib/utils";

/** @description 服务器环境变量配置 */
const serverEnv = serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    ENV: process.env.NODE_ENV,
});

export const serverEnvConfig = deepFreeze(deepClone(serverEnv));