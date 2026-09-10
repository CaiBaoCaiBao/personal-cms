import {
    apiHandler,
    parseJsonBody,
    parseQueryParams
} from "@/lib/utils/server";
import { z } from "zod";
import { SystemRouterService } from "@/lib/service/system-router.service";
import { createSystemRouterSchema } from "@/lib/schema/system-router.schema";

const idQuerySchema = z.object({
    id: z.string().min(1),
});

export const GET = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, idQuerySchema);
    const data = await SystemRouterService.getSystemRouter(id);
    return {
        ok: true,
        data,
        timestamp: new Date().toISOString(),
    };
});

export const PUT = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, idQuerySchema);
    const dto = await parseJsonBody(req, createSystemRouterSchema);
    await SystemRouterService.updateSystemRouter(id, dto);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString(),
    };
});
