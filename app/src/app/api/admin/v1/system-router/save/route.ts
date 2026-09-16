import {
    apiHandler,
    parseJsonBody
} from "@/lib/utils/server";
import { saveSystemRouterSchema } from "@/lib/schema/system-router.schema";
import { SystemRouterService } from "@/lib/services/system-router.service";

export const POST = apiHandler(async (req: Request) => {
    const dto = await parseJsonBody(req, saveSystemRouterSchema);
    await SystemRouterService.create(dto);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString()
    };
});

export const PUT = apiHandler(async (req: Request) => {
    const dto = await parseJsonBody(req, saveSystemRouterSchema);
    await SystemRouterService.update(dto);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString()
    };
});