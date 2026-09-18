import {
    apiHandler,
    parseJsonBody,
    parseQueryParams,
} from "@/lib/utils/server";
import { saveCategorySchema } from "@/lib/schema/category.schema";
import { CategoryService } from "@/lib/service";
import { z } from "zod";
const idQuerySchema = z.object({
    id: z.uuid(),
})

export const POST = apiHandler(async (req: Request) => {
    const dto = await parseJsonBody(req, saveCategorySchema);
    await CategoryService.create(dto);
    return {
        ok: true,
        data: void 0,
        timestamp: new Date().toISOString(),
    }
})

export const GET = apiHandler(async (req: Request) => {
    const bo = await CategoryService.getTree();
    return {
        ok: true,
        data: bo,
        timestamp: new Date().toISOString(),
    }
})

export const PUT = apiHandler(async (req: Request) => {
    const dto = await parseJsonBody(req, saveCategorySchema);
    const { id } = await parseQueryParams(req, idQuerySchema);
    await CategoryService.update(id, dto);
    return {
        ok: true,
        data: void 0,
        timestamp: new Date().toISOString(),
    }
})

export const DELETE = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, idQuerySchema);
    await CategoryService.remove(id);
    return {
        ok: true,
        data: void 0,
        timestamp: new Date().toISOString(),
    }
})