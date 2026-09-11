import {
    apiHandler,
    parseQueryParams
} from "@/lib/utils/server";
import { SystemRouterService } from "@/lib/service/system-router.service";
import { listSystemRouterQuerySchema } from "@/lib/schema/system-router.schema";
import { z } from "zod";

const deleteQuerySchema = z.object({
    id: z.string().min(1),
});
export const GET = apiHandler(async (req: Request) => {
    const query = await parseQueryParams(req, listSystemRouterQuerySchema);
    const data = await SystemRouterService.listTree(query);
    return {
        ok: true,
        data,
        timestamp: new Date().toISOString(),
    };
});

export const DELETE = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, deleteQuerySchema);
    await SystemRouterService.deleteSystemRouter(id);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString(),
    };
})