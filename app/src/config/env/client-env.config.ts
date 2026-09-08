import { clientEnv,ClientEnv } from "@/lib/schema/client-env.schema";
import { deepFrozenObj, deepCloneObj } from "@/lib/utils";

export const clientConfig = deepFrozenObj(
    deepCloneObj(clientEnv)
) as ClientEnv;