"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    createSystemRouterSchema,
    defaultValueCreateSystemRouter,
    type CreateSystemRouterDTO,
    type CreateSystemRouterFormValues,
} from "@/lib/schema/system-router.schema";
import type {
    FormOptions,
    RouteType,
    SystemRouterListVO,
} from "@/type/system-router.type";
import { HTTP } from "@/lib/utils/https";
import { systemRouterKeys } from "@/query/system-router.query";
import { AppError } from "@/lib/utils/errors/app-error";
import type { ApiResult } from "@/type/api-result.type";

interface Props {
    options: FormOptions;
}

function toFormValues(row?: SystemRouterListVO): CreateSystemRouterFormValues {
    if (!row) return defaultValueCreateSystemRouter;

    const base = {
        name: row.name,
        icon: row.icon ?? undefined,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
    };

    switch (row.routeType) {
        case "group":
            return {
                ...base,
                routeType: "group",
                path: null,
                parentId: undefined,
                defaultOpen: false,
            };
        case "page":
            return {
                ...base,
                routeType: "page",
                path: row.path ?? "/admin",
                parentId: row.parentId ?? undefined,
                defaultOpen: false,
            };
        case "directory":
            return {
                ...base,
                routeType: "directory",
                path: row.path ?? "/admin",
                parentId: row.parentId ?? undefined,
                defaultOpen: row.defaultOpen,
            };
        case "link":
            return {
                ...base,
                routeType: "link",
                path: row.path ?? "https://",
                parentId: row.parentId ?? undefined,
                defaultOpen: false,
            };
    }
}

async function assertApiOk(res: unknown) {
    if (res instanceof AppError) throw res;
    const result = res as ApiResult<null>;
    if (result && result.ok === true) return;
    if (result && result.ok === false) {
        throw new AppError(result.error.code, result.error.message);
    }
    throw new AppError("INTERNAL_ERROR", "网络请求失败");
}

export function applyRouteTypeValues(
    current: CreateSystemRouterFormValues,
    next: RouteType,
): CreateSystemRouterFormValues {
    const base = {
        name: current.name,
        icon: current.icon,
        sortOrder: current.sortOrder ?? 0,
        isActive: current.isActive ?? true,
    };

    if (next === "group") {
        return {
            ...base,
            routeType: "group",
            path: null,
            parentId: undefined,
            defaultOpen: false,
        };
    }

    const currentPath = current.path;
    if (next === "link") {
        return {
            ...base,
            routeType: "link",
            path:
                typeof currentPath === "string" && /^https?:\/\//.test(currentPath)
                    ? currentPath
                    : "https://",
            parentId: current.parentId,
            defaultOpen: false,
        };
    }

    const internalPath =
        typeof currentPath === "string" && currentPath.startsWith("/")
            ? currentPath
            : "/admin";

    if (next === "directory") {
        return {
            ...base,
            routeType: "directory",
            path: internalPath,
            parentId: current.parentId,
            defaultOpen: current.defaultOpen ?? false,
        };
    }

    return {
        ...base,
        routeType: "page",
        path: internalPath,
        parentId: current.parentId,
        defaultOpen: false,
    };
}

export function useSystemRouterForm({ options }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm({
        defaultValues: toFormValues(options.initialData),
        validators: {
            onSubmit: createSystemRouterSchema,
        },
        onSubmit: async ({ value }) => {
            const dto: CreateSystemRouterDTO = createSystemRouterSchema.parse(value);
            const res = options.id
                ? await HTTP.PUT(
                    `/api/admin/v1/system-router/edit?id=${encodeURIComponent(options.id)}`,
                    { params: dto as unknown as Record<string, unknown> },
                )
                : await HTTP.POST("/api/admin/v1/system-router", {
                    params: dto as unknown as Record<string, unknown>,
                });
            await assertApiOk(res);
            await queryClient.invalidateQueries({
                queryKey: systemRouterKeys.all,
            });
            router.push("/admin/system/router");
        },
    });
    return form;
}

export type SystemRouterForm = ReturnType<typeof useSystemRouterForm>;
