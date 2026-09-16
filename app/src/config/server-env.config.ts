import "server-only";

import { serverEnv, ServerEnvSchema, serverEnvSchema } from "@/lib/schema/env/server.schema";
import { deepCloneObj, deepFrozenObj } from "@/lib/utils";

export const serverEnvConfig = deepFrozenObj(deepCloneObj(serverEnv)) as ServerEnvSchema;