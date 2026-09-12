import { queryOptions } from "@tanstack/react-query";
import { HTTP } from "@/lib/utils/https";
import type { PageQueryDto } from "@/lib/schema/content-tag.schema";
import type { ContentTagItemVO } from "@/type/content-tag.type";
import type { Pagination } from "@/type/pagination.type";
import type { ApiSuccess } from "@/type/api-result.type";

export const contentTagKeys = {
    all: ["content-tag"] as const,
    lists: () => [...contentTagKeys.all, "list"] as const,
    list: (params: PageQueryDto) =>
        [...contentTagKeys.lists(), params] as const,
    detail: (id: string) =>
        [...contentTagKeys.all, "detail", id] as const,
};

export const contentTagListQuery = {
    list: (params: PageQueryDto) =>
        queryOptions({
            queryKey: contentTagKeys.list(params),
            queryFn: async ({ signal }) => {
                const res = await HTTP.GET("/api/admin/v1/content-tag", {
                    params: params as Record<string, unknown>,
                    signal,
                }) as ApiSuccess<Pagination<ContentTagItemVO>>;
                return res.data;
            },
        }),
};

export const contentTagDetailQuery = {
    get: (id: string) =>
        queryOptions({
            queryKey: contentTagKeys.detail(id),
            queryFn: async ({ signal }) => {
                const res = await HTTP.GET("/api/admin/v1/content-tag/detail", {
                    params: { id },
                    signal,
                }) as ApiSuccess<ContentTagItemVO | null>;
                return res.data;
            },
        }),
};
