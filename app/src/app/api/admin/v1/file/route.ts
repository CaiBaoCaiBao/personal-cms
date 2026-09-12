import { apiHandler, parseQueryParams,parseJsonBody } from "@/lib/utils/server";
import { FileService } from "@/lib/service/file.service";
import z from "zod";

export const POST = apiHandler(async (req: Request) => {
    const { filename } = await parseJsonBody(
        req,
        z.object({ filename: z.string().min(1) }),
    );
    const uploadKey = FileService.buildObjectKey(filename);
    const { token, key, url } = await FileService.getTokenAndFileUrl(uploadKey);
    return {
        ok: true,
        data: { token, key, url },
        timestamp: new Date().toISOString(),
    };
});


export const DELETE = apiHandler(async (req: Request) => {
    const { url } = await parseQueryParams(req, z.object({
        url: z.url("Invalid URL"),
    }))
    await FileService.deleteObjectByUrl(url);
    return {
        ok: true,
        data: void 0,
        timestamp: new Date().toISOString(),
    }
})