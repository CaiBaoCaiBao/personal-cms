import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    systemRouterKeys,
    systemRouterListQuery,
} from "@/query/system-router.query";
import type {
    SystemRouterTreeNode,
    PageOptions,
} from "@/type/system-router.type";
import { useState } from "react";
import { HTTP } from "@/lib/utils/https";
import { AppError } from "@/lib/utils/errors/app-error";
import type { ApiResult } from "@/type/api-result.type";

type PageState = {
    loading: boolean;
    deleting: boolean;
    deleteError: string | null;
    deleteDrawerOpen: boolean;
    deleteRow: SystemRouterTreeNode | null;
};

type PageActions = {
    setDeleteDrawerOpen: (open: boolean) => void;
    setDeleteRow: (row: SystemRouterTreeNode | null) => void;
    confirmDelete: () => void;
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
    const query = useQuery(systemRouterListQuery.list(params));

    const [drawer, setDrawer] = useState<{
        open: boolean;
        row: SystemRouterTreeNode | null;
    }>({
        open: false,
        row: null,
    });

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
        },
        actions,
        data,
    ];
}
