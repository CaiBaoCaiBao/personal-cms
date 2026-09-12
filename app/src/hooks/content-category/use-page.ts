"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    contentCategoryKeys,
    contentCategoryListQuery,
} from "@/query/content-category.query";
import type {
    ContentCategoryTreeNode,
    PageOptions,
} from "@/type/content-category.type";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HTTP } from "@/lib/utils/https";
import { AppError } from "@/lib/utils/errors/app-error";
import type { ApiResult } from "@/type/api-result.type";
import type { ListContentCategoryQueryDTO } from "@/lib/schema/content-category.schema";

function toSearch(params: ListContentCategoryQueryDTO) {
    const sp = new URLSearchParams();
    if (params.keyword) sp.set("keyword", params.keyword);
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
    deleteRow: ContentCategoryTreeNode | null;
    keyword: string;
    isActive: boolean | undefined;
};

type PageActions = {
    setDeleteDrawerOpen: (open: boolean) => void;
    setDeleteRow: (row: ContentCategoryTreeNode | null) => void;
    confirmDelete: () => void;
    setKeyword: (keyword: string) => void;
    setIsActive: (isActive: boolean | undefined) => void;
};

type PageData = {
    list: ContentCategoryTreeNode[];
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
    options: PageOptions,
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

    const query = useQuery(contentCategoryListQuery.list(queryParams));

    const [drawer, setDrawer] = useState<{
        open: boolean;
        row: ContentCategoryTreeNode | null;
    }>({
        open: false,
        row: null,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await HTTP.DELETE("/api/admin/v1/content-category", {
                params: { id },
            });
            await assertApiOk(res);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: contentCategoryKeys.all,
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

    return [
        {
            loading: query.isPending,
            deleting: deleteMutation.isPending,
            deleteError: deleteMutation.error?.message ?? null,
            deleteDrawerOpen: drawer.open,
            deleteRow: drawer.row,
            keyword,
            isActive: queryParams.isActive,
        },
        actions,
        {
            list: query.data ?? [],
        },
    ];
}
