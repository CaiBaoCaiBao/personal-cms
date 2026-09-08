import "server-only";
import { deepFrozenObj, deepCloneObj } from "@/lib/utils";
import {serverEnv, ServerEnv} from "@/lib/schema/server-env.shema";

export const serverConfig = deepFrozenObj(
    deepCloneObj(serverEnv)
) as ServerEnv;