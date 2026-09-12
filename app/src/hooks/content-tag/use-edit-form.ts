"use client";

import { useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
    createContentTagSchema,
    defaultValueEditForm,
    type CreateContentTagDto,
    type CreateContentTagFormValues,
} from "@/lib/schema/content-tag.schema";
import type { ContentTagItemVO, FormOptions } from "@/type/content-tag.type";
import { HTTP } from "@/lib/utils/https";
import { contentTagKeys } from "@/query/content-tag.query";
import { AppError } from "@/lib/utils/errors/app-error";
import type { ApiResult } from "@/type/api-result.type";

export function toFormValues(
    row?: ContentTagItemVO | null,
): CreateContentTagFormValues {
    if (!row) return defaultValueEditForm;
    return {
        name: row.name,
        slug: row.slug,
        description: row.description ?? "",
        isActive: row.isActive,
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

export function useEditForm(options: FormOptions) {
    const queryClient = useQueryClient();
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const form = useForm({
        defaultValues: toFormValues(options.initialData),
        validators: {
            onSubmit: createContentTagSchema,
        },
        onSubmit: async ({ value }) => {
            const dto: CreateContentTagDto = createContentTagSchema.parse(value);
            const { id, onSuccess } = optionsRef.current;
            const params = dto as unknown as Record<string, unknown>;
            const res = id
                ? await HTTP.PUT(
                    `/api/admin/v1/content-tag?id=${encodeURIComponent(id)}`,
                    { params },
                )
                : await HTTP.POST("/api/admin/v1/content-tag", { params });
            await assertApiOk(res);
            await queryClient.invalidateQueries({
                queryKey: contentTagKeys.all,
            });
            form.reset(defaultValueEditForm);
            onSuccess?.();
        },
    });

    const open = Boolean(options.open);
    const id = options.id ?? "";
    const initialData = options.initialData ?? null;

    useEffect(() => {
        if (!open) return;
        form.reset(toFormValues(initialData));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 打开弹窗时按当前标签回填
    }, [open, id, initialData]);

    return form;
}

export type EditForm = ReturnType<typeof useEditForm>;
