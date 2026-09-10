import {
    apiHandler,
    parseJsonBody,
    parseQueryParams,
 } from "@/lib/utils/server";
import { ContentTagService } from "@/lib/service/content-tag.service";
import {
    createContentTagSchema,
    pageQuerySchema,
 } from "@/lib/schema/content-tag.schema";
import { z } from "zod";
import { Pagination } from "@/type/pagination.type";
import { ContentTagItemVO } from "@/type/content-tag.type";

const idQuerySchema = z.object({
    id: z.string().min(1),
});

const idsQuerySchema = z.object({
    ids: z.array(z.string().min(1)),
});

export const POST = apiHandler(async (req: Request) => {
    const dto = await parseJsonBody(req, createContentTagSchema);
    await ContentTagService.createContentTag(dto);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString(),
    }
})

export const PUT = apiHandler(async (req: Request) => {
    const { id } = await parseQueryParams(req, idQuerySchema);
    const dto = await parseJsonBody(req, createContentTagSchema);
    await ContentTagService.updateContentTag(id, dto);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString(),
    }
})

export const DELETE = apiHandler(async (req: Request) => {
    const { ids } = await parseQueryParams(req, idsQuerySchema);
    await ContentTagService.removeMany(ids);
    return {
        ok: true,
        data: null,
        timestamp: new Date().toISOString(),
    }
});

export const GET = apiHandler(async (req: Request) => {
    const query = await parseQueryParams(req, pageQuerySchema);
    const data = await ContentTagService.paginate(query) as Pagination<ContentTagItemVO>;
    return {
        ok: true,
        data,
        timestamp: new Date().toISOString(),
    }
});