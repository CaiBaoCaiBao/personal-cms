import { serverEnvConfig } from "@/config/server-env.config";
import { NotFoundError } from "@/lib/errors";
import { type AppError } from "@/lib/errors/app-error";
import { toAppError } from "@/lib/errors/server";
import { MediaFileService } from "@/lib/service";
import { paginationSchema } from "@/lib/schema/globals.schema";
import { mediaFileQuerySchema } from "@/lib/schema/media/media-file.schema";

function readParam(searchParams: URLSearchParams, key: string) {
    const value = searchParams.get(key)?.trim();
    return value ? value : undefined;
}

function assertDebugApi() {
    if (serverEnvConfig.node.isPro) {
        throw new NotFoundError("MEDIA_FILE", "MEDIA_FILE_API_NOT_AVAILABLE");
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
        const query = mediaFileQuerySchema.parse({
            originalName: readParam(searchParams, "originalName"),
            mimeType: readParam(searchParams, "mimeType"),
            createdFrom: readParam(searchParams, "createdFrom"),
            createdTo: readParam(searchParams, "createdTo"),
        });
        const pagination = paginationSchema.parse({
            pageIndex: readParam(searchParams, "pageIndex"),
            pageSize: readParam(searchParams, "pageSize"),
        })
        const result = await MediaFileService.pagination(query, pagination);
        return Response.json(result);
    } catch (error) {
        return toErrorResponse(toAppError(error, "MEDIA_FILE"));
    }
};
