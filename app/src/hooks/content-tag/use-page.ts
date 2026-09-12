import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    PageOptions,
    ContentTagItemVO,
} from "@/type/content-tag.type";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { contentTagKeys, contentTagListQuery } from "@/query/content-tag.query";
import {
    defaultValuePageQuery,
    type PageQueryDto,
} from "@/lib/schema/content-tag.schema";
import { HTTP } from "@/lib/utils/https";
import { AppError } from "@/lib/utils/errors/app-error";
import type { ApiResult } from "@/type/api-result.type";

function toSearch(params: PageQueryDto) {
    const sp = new URLSearchParams();
    if (params.pageNumber !== defaultValuePageQuery.pageNumber) {
        sp.set("pageNumber", String(params.pageNumber));
    }
    if (params.pageSize !== defaultValuePageQuery.pageSize) {
        sp.set("pageSize", String(params.pageSize));
    }
    if (params.keyword) sp.set("keyword", params.keyword);
    if (typeof params.isActive === "boolean") {
        sp.set("isActive", String(params.isActive));
    }
    return sp.toString();
}

type PageState = {
    openEditForm: boolean;
    editTag: ContentTagItemVO | null;
    deleting: boolean;
    deleteError: string | null;
    detailDrawerOpen: boolean;
    detailRow: ContentTagItemVO | null;
    keyword: string;
    pageNumber: number;
    pageSize: number;
};

type PageActions = {
    setOpenEditForm: (open: boolean) => void;
    setEditTag: (tag: ContentTagItemVO | null) => void;
    openCreate: () => void;
    openEdit: (tag: ContentTagItemVO) => void;
    setOpenDetailDrawer: (open: boolean) => void;
    setDetailRow: (row: ContentTagItemVO | null) => void;
    confirmDelete: () => void;
    setKeyword: (keyword: string) => void;
    setPageNumber: (pageNumber: number) => void;
};

type PageData = {
    list: ContentTagItemVO[];
    total: number;
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
                return {
                    ...prev,
                    pageNumber: 1,
                    keyword: nextKeyword,
                };
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

    const query = useQuery(contentTagListQuery.list(queryParams));
    const [edit, setEdit] = useState<{
        open: boolean;
        tag: ContentTagItemVO | null;
    }>({
        open: false,
        tag: null,
    });

    const [drawer, setDrawer] = useState<{
        open: boolean;
        row: ContentTagItemVO | null;
    }>({
        open: false,
        row: null,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await HTTP.DELETE("/api/admin/v1/content-tag", {
                params: { ids: [id] },
            });
            await assertApiOk(res);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: contentTagKeys.all,
            });
            setDrawer((prev) => ({ ...prev, open: false }));
        },
    });

    const actions: PageActions = {
        setOpenEditForm: (open) => {
            setEdit((prev) => ({
                ...prev,
                open,
                tag: open ? prev.tag : null,
            }));
        },
        setEditTag: (tag) => {
            setEdit((prev) => ({ ...prev, tag }));
        },
        openCreate: () => {
            setEdit({ open: true, tag: null });
        },
        openEdit: (tag) => {
            setEdit({ open: true, tag });
        },
        setOpenDetailDrawer: (open) => {
            if (deleteMutation.isPending && !open) return;
            setDrawer((prev) => ({ ...prev, open }));
            if (!open) deleteMutation.reset();
        },
        setDetailRow: (row) => {
            setDrawer((prev) => ({ ...prev, row }));
            deleteMutation.reset();
        },
        confirmDelete: () => {
            const id = drawer.row?.id;
            if (!id || deleteMutation.isPending) return;
            deleteMutation.mutate(id);
        },
        setKeyword: (keyword) => {
            setKeyword(keyword);
        },
        setPageNumber: (pageNumber) => {
            setQueryParams((prev) => ({ ...prev, pageNumber }));
        },
    };

    return [
        {
            openEditForm: edit.open,
            editTag: edit.tag,
            deleting: deleteMutation.isPending,
            deleteError: deleteMutation.error?.message ?? null,
            detailDrawerOpen: drawer.open,
            detailRow: drawer.row,
            keyword: keyword,
            pageNumber: queryParams.pageNumber,
            pageSize: queryParams.pageSize,
        },
        actions,
        {
            list: query.data?.list ?? [],
            total: query.data?.total ?? 0,
        },
    ];
}
