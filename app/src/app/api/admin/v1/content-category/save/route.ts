import { z } from "zod";
import {
    apiHandler,
    parseQueryParams,
    parseJsonBody
} from "@/lib/utils/server";
import { ContentCategoryService } from "@/lib/service/content-category.service";
import { saveContentCategorySchema } from "@/lib/schema/content-category.schema";

const idQuerySchema = z.object({
    id: z.string().min(1),
});

export const POST = apiHandler(async (req: Request) => {
    const dto = await parseJsonBody(req, saveContentCategorySchema);
    await ContentCategoryService.createContentCategory(dto);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString(),
    }
})

export const PUT = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, idQuerySchema);
    const dto = await parseJsonBody(req, saveContentCategorySchema);
    await ContentCategoryService.updateContentCategory(id, dto);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString(),
    }
})

export const GET = apiHandler(async () => {
    const data = await ContentCategoryService.listParentOptions();
    return {
        ok: true,
        data,
        timestamp: new Date().toISOString(),
    }
})