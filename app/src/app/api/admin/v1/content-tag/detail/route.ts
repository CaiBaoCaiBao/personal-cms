import { z } from "zod";
import { apiHandler, parseQueryParams } from "@/lib/utils/server";
import { ContentTagService } from "@/lib/service/content-tag.service";

const idQuerySchema = z.object({
    id: z.string().min(1),
});

export const GET = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, idQuerySchema);
    const data = await ContentTagService.getDetail(id);
    return {
        ok: true,
        data,
        timestamp: new Date().toISOString(),
    }
});