import "server-only";

import { deepCloneObj, deepFrozenObj } from "@/lib/utils";
import { ServerEnv, serverEnv } from "@/lib/schema/env/serverr.schema";

export const serverEnvConfig = deepFrozenObj(deepCloneObj(serverEnv)) as ServerEnv;