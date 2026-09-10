import { queryOptions } from "@tanstack/react-query";
import { HTTP } from "@/lib/utils/https";
import type {
    AdminNavGroup,
    SystemRouterListQuery,
    SystemRouterTreeNode,
    SystemRouterListVO,
} from "@/type/system-router.type";
import type { ApiSuccess } from "@/type/api-result.type";

export const systemRouterKeys = {
    all: ["system-router"] as const,
    lists: () => [...systemRouterKeys.all, "list"] as const,
    list: (params: SystemRouterListQuery) =>
        [...systemRouterKeys.lists(), params] as const,
    detail: (id: string) =>
        [...systemRouterKeys.all, "detail", id] as const,
    nav: () => [...systemRouterKeys.all, "nav"] as const,
};

export const systemRouterListQuery = {
    list: (params: SystemRouterListQuery) =>
        queryOptions({
            queryKey: systemRouterKeys.list(params),
            queryFn: async ({ signal }) => {
                const res = await HTTP.GET("/api/admin/v1/system-router", {
                    params: params as Record<string, unknown>,
                    signal,
                }) as ApiSuccess<SystemRouterTreeNode[]>;
                return res.data;
            },
        }),
};

export const systemRouterDetailQuery = {
    get: (id: string) =>
        queryOptions({
            queryKey: systemRouterKeys.detail(id),
            queryFn: async ({ signal }) => {
                const res = await HTTP.GET("/api/admin/v1/system-router/edit",
                    {
                        params: { id },
                        signal
                    }
                ) as ApiSuccess<SystemRouterListVO>;
                return res.data;
            },
        }),
};

export const systemRouterNavQuery = {
    nav: () =>
        queryOptions({
            queryKey: systemRouterKeys.nav(),
            queryFn: async ({ signal }) => {
                const res = await HTTP.GET("/api/admin/v1/system-router/nav", {
                    signal,
                }) as ApiSuccess<AdminNavGroup[]>;
                return res.data;
            },
        }),
};