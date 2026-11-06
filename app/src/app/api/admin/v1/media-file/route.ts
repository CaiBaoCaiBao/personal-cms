import { serverEnvConfig } from "@/config/server-env.config";
import { NotFoundError } from "@/lib/errors";
import { type AppError } from "@/lib/errors/app-error";
import { toAppError } from "@/lib/errors/server";
import { MediaFileService } from "@/lib/service";
import { z } from "zod";

const listQuerySchema = z.object({
    pageIndex: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().min(0).default(0),
    ),
    pageSize: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().min(1).max(100).default(20),
    ),
    originalName: z.string().trim().min(1).optional(),
    mimeType: z.string().trim().min(1).optional(),
    createdFrom: z.iso.datetime().optional(),
    createdTo: z.iso.datetime().optional(),
});

function readParam(searchParams: URLSearchParams, key: string) {
    const value = searchParams.get(key)?.trim();
    return value ? value : undefined;
}

function assertDebugApi() {
    if (serverEnvConfig.node.isPro) {
        throw new NotFoundError("MEDIA", "MEDIA_FILE_API_NOT_AVAILABLE");
    }
}

function toErrorResponse(error: AppError) {
    return Response.json(
        {
            code: error.code,
            message: error.message,
            module: error.module,
            details: error.details,
            errorId: error.errorId,
            timestamp: error.timestamp,
        },
        { status: error.status },
    );
}

/** @description 开发与测试环境的媒体文件分页查询 */
export const GET = async (request: Request) => {
    try {
        assertDebugApi();

        const { searchParams } = new URL(request.url);
        const { pageIndex, pageSize, ...filter } = listQuerySchema.parse({
            pageIndex: readParam(searchParams, "pageIndex"),
            pageSize: readParam(searchParams, "pageSize"),
            originalName: readParam(searchParams, "originalName"),
            mimeType: readParam(searchParams, "mimeType"),
            createdFrom: readParam(searchParams, "createdFrom"),
            createdTo: readParam(searchParams, "createdTo"),
        });
        const result = await MediaFileService.pagination(filter, { pageIndex, pageSize });
        return Response.json(result);
    } catch (error) {
        return toErrorResponse(toAppError(error, "MEDIA"));
    }
};
