import { z } from "zod";
import {
    apiHandler,
    parseQueryParams,
} from "@/lib/utils/server";
import { ContentCategoryService } from "@/lib/service/content-category.service";
import { listContentCategorySchema } from "@/lib/schema/content-category.schema";

const idQuerySchema = z.object({
    id: z.string().min(1),
});

export const GET = apiHandler(async (req: Request) => {
    const params = await parseQueryParams(req, listContentCategorySchema);
    const data = await ContentCategoryService.listTree(params);
    return {
        ok: true,
        data,
        timestamp: new Date().toISOString(),
    }
});

export const DELETE = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, idQuerySchema);
    await ContentCategoryService.deleteContentCategory(id);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString(),
    }
})