import {
    apiHandler,
    parseJsonBody,
    parseQueryParams,
} from "@/lib/utils/server";
import { z } from "zod";
import { isEmpty } from "@/lib/utils";

const paramsSchema = z.object({
    name: z.coerce.string().optional(),
    age: z.coerce.number().optional(),
});
export type TestHttpParams = z.infer<typeof paramsSchema>;

export const GET = apiHandler(async (req: Request) => {
    const dto = await parseQueryParams(req, paramsSchema);

    return {
        ok: true,
        data: isEmpty(dto) ? null : dto,
        timestamp: new Date().toISOString(),
    }
});

export const POST = apiHandler(async (req: Request) => {
    const dto = await parseJsonBody(req, paramsSchema);
    return {
        ok: true,
        data: isEmpty(dto) ? null : dto,
        timestamp: new Date().toISOString(),
    }
});

export const PUT = apiHandler(async (req: Request) => {
    const dto = await parseJsonBody(req, paramsSchema);
    return {
        ok: true,
        data: isEmpty(dto) ? null : dto,
        timestamp: new Date().toISOString(),
    }
});

export const DELETE = apiHandler(async (req: Request) => {
    const dto = await parseQueryParams(req, paramsSchema);
    return {
        ok: true,
        data: isEmpty(dto) ? null : dto,
        timestamp: new Date().toISOString(),
    }
});