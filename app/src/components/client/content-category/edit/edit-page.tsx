"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import {
    applyParentSlug,
    useEditForm,
} from "@/hooks/content-category/use-edit-form";
import { useId } from "react";
import type {
    ContentCategoryParentOption,
    FormOptions,
} from "@/type/content-category.type";
import { contentCategoryDetailQuery } from "@/query/content-category.query";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldContent,
    FieldSet,
    FieldLegend,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, CircleAlert, Save } from "lucide-react";

interface Props {
    id?: string;
    parentCategories: ContentCategoryParentOption[];
}

const PARENT_NONE = "";

function RequiredMark() {
    return <span className="text-destructive">*</span>;
}

function ToggleRow({
    id,
    name,
    label,
    description,
    checked,
    onBlur,
    onChange,
}: {
    id: string;
    name: string;
    label: string;
    description: string;
    checked: boolean;
    onBlur: () => void;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label
            htmlFor={id}
            className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
        >
            <div className="min-w-0">
                <div className="text-sm font-medium leading-snug">{label}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
            <input
                id={id}
                name={name}
                type="checkbox"
                checked={checked}
                onBlur={onBlur}
                onChange={(e) => onChange(e.target.checked)}
                className="size-4 shrink-0 accent-primary"
            />
        </label>
    );
}

export function EditPage({
    id,
    parentCategories,
}: Props) {
    const { data, isPending, isError } = useQuery(
        id
            ? contentCategoryDetailQuery.get(id)
            : { queryKey: ["content-category", "detail", "new"] as const, queryFn: skipToken },
    );
    const options: FormOptions = {
        id,
        parentCategories,
        initialData: data,
    };
    const formId = `content-category-edit-${useId()}`;
    const form = useEditForm(options);
    const parentItems = [
        { value: PARENT_NONE, label: "无（根级）" },
        ...parentCategories.map((item) => ({
            value: item.id,
            label: `${item.name}（${item.slug}）`,
        })),
    ];

    if (id && isPending) {
        return (
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
                <div className="rounded-xl border border-border/80 p-5">
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    if (id && isError) {
        return (
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-destructive">
                            分类不存在或加载失败
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            请返回列表后重试，或确认该分类仍存在。
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/admin/content/category" />}
                >
                    <ArrowLeft />
                    返回列表
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {id ? "编辑分类" : "新增分类"}
                        </h1>
                        <Badge variant="outline">{id ? "编辑" : "新建"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        子分类的标识必须比父级多恰好一段，例如 parent/child。
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/admin/content/category" />}
                >
                    <ArrowLeft />
                    返回
                </Button>
            </div>

            <form
                id={formId}
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
                className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
            >
                <div className="flex flex-col gap-6 p-5 sm:p-6">
                    <FieldSet>
                        <FieldLegend>基本信息</FieldLegend>
                        <FieldDescription>
                            名称会出现在管理列表与前台分类中。
                        </FieldDescription>
                        <FieldGroup>
                            <form.Field
                                name="name"
                                children={(field) => {
                                    const isInvalid =
                                        !field.state.meta.isValid && field.state.meta.isTouched;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                名称
                                                <RequiredMark />
                                            </FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="分类名称"
                                                    autoComplete="off"
                                                />
                                            </FieldContent>
                                            {isInvalid ? (
                                                <FieldError errors={field.state.meta.errors} />
                                            ) : (
                                                <FieldDescription>
                                                    列表与文章中显示的分类名
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="parentId"
                                children={(field) => {
                                    const isInvalid =
                                        !field.state.meta.isValid && field.state.meta.isTouched;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                父级
                                            </FieldLabel>
                                            <FieldContent>
                                                <Select
                                                    items={parentItems}
                                                    value={field.state.value ?? PARENT_NONE}
                                                    onValueChange={(value) => {
                                                        const nextId = value ? String(value) : undefined;
                                                        const parentSlug = parentCategories.find(
                                                            (item) => item.id === nextId,
                                                        )?.slug;
                                                        form.reset({
                                                            ...form.state.values,
                                                            parentId: nextId,
                                                            slug: applyParentSlug(
                                                                form.state.values.slug,
                                                                parentSlug,
                                                            ),
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger id={field.name} className="w-full">
                                                        <SelectValue placeholder="选择父级" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {parentItems.map((item) => (
                                                                <SelectItem
                                                                    key={item.value || "root"}
                                                                    value={item.value}
                                                                >
                                                                    {item.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FieldContent>
                                            {isInvalid ? (
                                                <FieldError errors={field.state.meta.errors} />
                                            ) : (
                                                <FieldDescription>
                                                    留空则为根级分类
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="slug"
                                children={(field) => {
                                    const isInvalid =
                                        !field.state.meta.isValid && field.state.meta.isTouched;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                标识
                                                <RequiredMark />
                                            </FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="tech 或 parent/child"
                                                    autoComplete="off"
                                                    className="font-mono"
                                                />
                                            </FieldContent>
                                            {isInvalid ? (
                                                <FieldError errors={field.state.meta.errors} />
                                            ) : (
                                                <FieldDescription>
                                                    仅小写字母、数字与连字符，层级用 / 分隔，每段至少 2 个字符
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="description"
                                children={(field) => {
                                    const isInvalid =
                                        !field.state.meta.isValid && field.state.meta.isTouched;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>描述</FieldLabel>
                                            <FieldContent>
                                                <Textarea
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value ?? ""}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(e.target.value || undefined)
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="可选，说明该分类的用途"
                                                    rows={3}
                                                />
                                            </FieldContent>
                                            {isInvalid ? (
                                                <FieldError errors={field.state.meta.errors} />
                                            ) : (
                                                <FieldDescription>可留空</FieldDescription>
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                        </FieldGroup>
                    </FieldSet>

                    <FieldSeparator />

                    <FieldSet>
                        <FieldLegend>展示设置</FieldLegend>
                        <FieldGroup>
                            <form.Field
                                name="sortOrder"
                                children={(field) => {
                                    const isInvalid =
                                        !field.state.meta.isValid && field.state.meta.isTouched;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>排序</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="number"
                                                    min={0}
                                                    value={field.state.value ?? 0}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            Number.parseInt(e.target.value, 10) || 0,
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    className="sm:max-w-32"
                                                />
                                            </FieldContent>
                                            {isInvalid ? (
                                                <FieldError errors={field.state.meta.errors} />
                                            ) : (
                                                <FieldDescription>
                                                    越小越靠前
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                        </FieldGroup>
                    </FieldSet>

                    <FieldSeparator />

                    <FieldSet>
                        <FieldLegend>状态</FieldLegend>
                        <FieldGroup>
                            <form.Field
                                name="isActive"
                                children={(field) => (
                                    <ToggleRow
                                        id={field.name}
                                        name={field.name}
                                        label="启用"
                                        description="关闭后列表中将不再默认展示该分类"
                                        checked={Boolean(field.state.value)}
                                        onBlur={field.handleBlur}
                                        onChange={field.handleChange}
                                    />
                                )}
                            />
                        </FieldGroup>
                    </FieldSet>
                </div>

                <div className="border-t border-border/80 bg-muted/20 px-5 py-3.5 sm:px-6">
                    <form.Subscribe
                        selector={(state) =>
                            [
                                state.canSubmit,
                                state.isSubmitting,
                                state.errorMap.onSubmit,
                            ] as const
                        }
                    >
                        {([canSubmit, isSubmitting, submitError]) => (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {submitError ? (
                                    <p className="text-sm text-destructive">
                                        {typeof submitError === "string"
                                            ? submitError
                                            : submitError instanceof Error
                                                ? submitError.message
                                                : "提交失败，请稍后重试"}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        保存后将返回分类列表。
                                    </p>
                                )}
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        nativeButton={false}
                                        disabled={isSubmitting}
                                        render={
                                            <Link href="/admin/content/category" />
                                        }
                                    >
                                        取消
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!canSubmit || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner />
                                                提交中...
                                            </>
                                        ) : (
                                            <>
                                                <Save />
                                                {id ? "保存" : "创建"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form.Subscribe>
                </div>
            </form>
        </div>
    );
}
