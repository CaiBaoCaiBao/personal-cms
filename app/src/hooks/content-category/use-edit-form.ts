"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    defaultValueSaveForm,
    saveContentCategorySchema,
    type SaveContentCategoryDto,
    type SaveContentCategoryFormValues,
} from "@/lib/schema/content-category.schema";
import type {
    ContentCategoryItemVO,
    FormOptions,
} from "@/type/content-category.type";
import { HTTP } from "@/lib/utils/https";
import { contentCategoryKeys } from "@/query/content-category.query";
import { AppError } from "@/lib/utils/errors/app-error";
import type { ApiResult } from "@/type/api-result.type";

export function toFormValues(
    row?: ContentCategoryItemVO,
): SaveContentCategoryFormValues {
    if (!row) return defaultValueSaveForm;
    return {
        name: row.name,
        slug: row.slug,
        description: row.description || undefined,
        isActive: row.isActive,
        parentId: row.parentId ?? undefined,
        sortOrder: row.sortOrder,
    };
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

export function applyParentSlug(
    currentSlug: string,
    parentSlug?: string,
): string {
    const segment = currentSlug.split("/").filter(Boolean).at(-1) ?? "";
    if (!parentSlug) return segment;
    return segment ? `${parentSlug}/${segment}` : `${parentSlug}/`;
}

export function useEditForm(options: FormOptions) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm({
        defaultValues: toFormValues(options.initialData),
        validators: {
            onSubmit: saveContentCategorySchema,
        },
        onSubmit: async ({ value }) => {
            const dto: SaveContentCategoryDto =
                saveContentCategorySchema.parse(value);
            const params = dto as unknown as Record<string, unknown>;
            const res = options.id
                ? await HTTP.PUT(
                    `/api/admin/v1/content-category/save?id=${encodeURIComponent(options.id)}`,
                    { params },
                )
                : await HTTP.POST("/api/admin/v1/content-category/save", {
                    params,
                });
            await assertApiOk(res);
            queryClient.removeQueries({
                queryKey: contentCategoryKeys.lists(),
            });
            if (options.id) {
                queryClient.removeQueries({
                    queryKey: contentCategoryKeys.detail(options.id),
                });
            }
            router.push("/admin/content/category");
        },
    });

    const initialId = options.initialData?.id ?? "";
    useEffect(() => {
        if (!options.initialData) return;
        form.reset(toFormValues(options.initialData));
        // 详情到达后回填一次，避免 hydrate 未命中时表单停在空值
    }, [initialId]);

    return form;
}

export type ContentCategoryForm = ReturnType<typeof useEditForm>;
