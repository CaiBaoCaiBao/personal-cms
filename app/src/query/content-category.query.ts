import { queryOptions } from "@tanstack/react-query";
import { HTTP } from "@/lib/utils/https";
import type {
    ContentCategoryTreeNode,
    ContentCategoryItemVO,
} from "@/type/content-category.type";
import type { ApiSuccess } from "@/type/api-result.type";
import type { ListContentCategoryQueryDTO } from "@/lib/schema/content-category.schema";

export const contentCategoryKeys = {
    all: ["content-category"] as const,
    lists: () => [...contentCategoryKeys.all, "list"] as const,
    list: (params: ListContentCategoryQueryDTO) =>
        [...contentCategoryKeys.lists(), params] as const,
    detail: (id: string) =>
        [...contentCategoryKeys.all, "detail", id] as const,
};

export const contentCategoryListQuery = {
    list: (params: ListContentCategoryQueryDTO) =>
        queryOptions({
            queryKey: contentCategoryKeys.list(params),
            queryFn: async ({ signal }) => {
                const res = await HTTP.GET("/api/admin/v1/content-category", {
                    params: params as Record<string, unknown>,
                    signal,
                }) as ApiSuccess<ContentCategoryTreeNode[]>;
                return res.data;
            },
        }),
};

export const contentCategoryDetailQuery = {
    get: (id: string) =>
        queryOptions({
            queryKey: contentCategoryKeys.detail(id),
            queryFn: async ({ signal }) => {
                const res = await HTTP.GET("/api/admin/v1/content-category/edit", {
                    params: { id },
                    signal,
                }) as ApiSuccess<ContentCategoryItemVO>;
                return res.data;
            },
        }),
};