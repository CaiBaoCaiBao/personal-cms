import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    systemRouterKeys,
    systemRouterListQuery,
} from "@/query/system-router.query";
import type {
    SystemRouterTreeNode,
    PageOptions,
} from "@/type/system-router.type";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HTTP } from "@/lib/utils/https";
import { AppError } from "@/lib/utils/errors/app-error";
import type { ApiResult } from "@/type/api-result.type";
import { useThrottleCallback } from "@/hooks/use-throttle-callback";
import type { ListSystemRouterQueryDTO } from "@/lib/schema/system-router.schema";

function toSearch(params: ListSystemRouterQueryDTO) {
    const sp = new URLSearchParams();
    if (params.keyword) sp.set("keyword", params.keyword);
    if (params.routeType) sp.set("routeType", params.routeType);
    if (typeof params.isActive === "boolean") {
        sp.set("isActive", String(params.isActive));
    }
    return sp.toString();
}

type PageState = {
    loading: boolean;
    deleting: boolean;
    deleteError: string | null;
    deleteDrawerOpen: boolean;
    deleteRow: SystemRouterTreeNode | null;
    refreshing: boolean;
    keyword: string;
    isActive: boolean | undefined;
};

type PageActions = {
    setDeleteDrawerOpen: (open: boolean) => void;
    setDeleteRow: (row: SystemRouterTreeNode | null) => void;
    confirmDelete: () => void;
    handleRefreshRouter: () => void;
    setKeyword: (keyword: string) => void;
    setIsActive: (isActive: boolean | undefined) => void;
};

type PageData = {
    list: SystemRouterTreeNode[];
};

async function assertApiOk(res: unknown) {
    if (res instanceof AppError) throw res;
    const result = res as ApiResult<null>;
    if (result && result.ok === true) return;
    if (result && result.ok === false) {
        throw new AppError(result.error.code, result.error.message);
    }
    throw new AppError("INTERNAL_ERROR", "网络请求失败");
}

export function usePage(
    options: PageOptions
): [PageState, PageActions, PageData] {
    const { params } = options;
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();

    const [keyword, setKeyword] = useState(params.keyword ?? "");
    const [queryParams, setQueryParams] = useState(params);

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextKeyword = keyword.trim() || undefined;
            setQueryParams((prev) => {
                if (prev.keyword === nextKeyword) return prev;
                return { ...prev, keyword: nextKeyword };
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        const qs = toSearch(queryParams);
        const href = qs ? `${pathname}?${qs}` : pathname;
        const current = `${window.location.pathname}${window.location.search}`;
        if (current === href) return;
        router.replace(href, { scroll: false });
    }, [queryParams, pathname, router]);

    const query = useQuery(systemRouterListQuery.list(queryParams));

    const [drawer, setDrawer] = useState<{
        open: boolean;
        row: SystemRouterTreeNode | null;
    }>({
        open: false,
        row: null,
    });

    const [refreshing, setRefreshing] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await HTTP.DELETE("/api/admin/v1/system-router", {
                params: { id },
            });
            await assertApiOk(res);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: systemRouterKeys.all,
            });
            setDrawer((prev) => ({ ...prev, open: false }));
        },
    });

    const actions: PageActions = {
        setDeleteDrawerOpen: (open) => {
            if (deleteMutation.isPending && !open) return;
            setDrawer((prev) => ({ ...prev, open }));
            if (!open) deleteMutation.reset();
        },
        setDeleteRow: (row) => {
            setDrawer((prev) => ({ ...prev, row }));
            deleteMutation.reset();
        },
        confirmDelete: () => {
            const id = drawer.row?.id;
            if (!id || deleteMutation.isPending) return;
            deleteMutation.mutate(id);
        },
        handleRefreshRouter: useThrottleCallback(async () => {
            setRefreshing(true);
            await queryClient.invalidateQueries({
                queryKey: systemRouterKeys.nav(),
            });
            setRefreshing(false);
        }),
        setKeyword: (value) => {
            setKeyword(value);
        },
        setIsActive: (isActive) => {
            setQueryParams((prev) => {
                if (prev.isActive === isActive) return prev;
                return { ...prev, isActive };
            });
        },
    };

    const data: PageData = {
        list: query.data ?? [],
    };

    return [
        {
            loading: query.isPending,
            deleting: deleteMutation.isPending,
            deleteError: deleteMutation.error?.message ?? null,
            deleteDrawerOpen: drawer.open,
            deleteRow: drawer.row,
            refreshing: refreshing,
            keyword,
            isActive: queryParams.isActive,
        },
        actions,
        data,
    ];
}
