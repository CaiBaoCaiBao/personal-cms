import {
    apiHandler,
    parseQueryParams,
} from "@/lib/utils/server";
import { z } from "zod";
import { ContentCategoryService } from "@/lib/service/content-category.service";

const idQuerySchema = z.object({
    id: z.string().min(1),
});

export const GET = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, idQuerySchema);
    const data = await ContentCategoryService.getContentCategory(id);
    return {
        ok: true,
        data,
        timestamp: new Date().toISOString(),
    };
});
