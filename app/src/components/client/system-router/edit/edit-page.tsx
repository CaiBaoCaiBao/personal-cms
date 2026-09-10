"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import {
    applyRouteTypeValues,
    useSystemRouterForm,
} from "@/hooks/system-router/useSystemRouterForm";
import { useId } from "react";
import type {
    FormOptions,
    RouteType,
    SystemRouterParentOption,
} from "@/type/system-router.type";
import { systemRouterDetailQuery } from "@/query/system-router.query";
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
import { ROUTE_TYPE_LABEL } from "@/constant/system-router.constant";
import { resolveNavIcon } from "@/components/server/nav-icon";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, CircleAlert, Save } from "lucide-react";

interface Props {
    id?: string;
    parentRouters: SystemRouterParentOption[];
}

const PARENT_NONE = "";

const ROUTE_TYPE_HINT: Record<RouteType, string> = {
    group: "分组作为侧栏分区，无路径、不可挂父级。",
    directory: "目录可折叠，需内部路径，可设置默认展开。",
    page: "内部页面，路径须为 /a/b 形式。",
    link: "外部链接，仅支持 http/https。",
};

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
    parentRouters,
}: Props) {
    const { data, isPending, isError } = useQuery(
        id
            ? systemRouterDetailQuery.get(id)
            : { queryKey: ["system-router", "detail", "new"] as const, queryFn: skipToken },
    );
    const options: FormOptions = {
        id,
        parentRouters,
        initialData: data,
    };
    const formId = `system-router-edit-${useId()}`;
    const form = useSystemRouterForm(options);
    const parentItems = [
        { value: PARENT_NONE, label: "无（根级）" },
        ...parentRouters.map((item) => ({
            value: item.id,
            label: item.path ? `${item.name}（${item.path}）` : item.name,
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
                            路由不存在或加载失败
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            请返回列表后重试，或确认该路由仍存在。
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/admin/system/router" />}
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
                            {id ? "编辑路由" : "新增路由"}
                        </h1>
                        <Badge variant="outline">{id ? "编辑" : "新建"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        按类型填写路径与父级，分组只能作为根节点。
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/admin/system/router" />}
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
                            名称会同时出现在侧栏与管理列表中。
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
                                                    placeholder="路由名称"
                                                    autoComplete="off"
                                                />
                                            </FieldContent>
                                            {isInvalid ? (
                                                <FieldError errors={field.state.meta.errors} />
                                            ) : (
                                                <FieldDescription>
                                                    侧栏和列表中显示的名称
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="routeType"
                                children={(field) => {
                                    const isInvalid =
                                        !field.state.meta.isValid && field.state.meta.isTouched;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                路由类型
                                                <RequiredMark />
                                            </FieldLabel>
                                            <FieldContent>
                                                <Select
                                                    items={ROUTE_TYPE_LABEL}
                                                    value={field.state.value}
                                                    onValueChange={(value) => {
                                                        const next = value as RouteType | null;
                                                        if (!next) return;
                                                        form.reset(
                                                            applyRouteTypeValues(form.state.values, next),
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger id={field.name} className="w-full">
                                                        <SelectValue placeholder="选择类型" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {ROUTE_TYPE_LABEL.map((item) => (
                                                                <SelectItem
                                                                    key={item.value}
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
                                                    {ROUTE_TYPE_HINT[field.state.value]}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                        </FieldGroup>
                    </FieldSet>

                    <form.Subscribe selector={(state) => state.values.routeType}>
                        {(routeType) =>
                            routeType !== "group" ? (
                                <>
                                    <FieldSeparator />
                                    <FieldSet>
                                        <FieldLegend>路由配置</FieldLegend>
                                        <FieldDescription>
                                            {ROUTE_TYPE_HINT[routeType]}
                                        </FieldDescription>
                                        <FieldGroup>
                                            <form.Field
                                                name="path"
                                                children={(field) => {
                                                    const isInvalid =
                                                        !field.state.meta.isValid &&
                                                        field.state.meta.isTouched;
                                                    const isLink = routeType === "link";
                                                    return (
                                                        <Field data-invalid={isInvalid}>
                                                            <FieldLabel htmlFor={field.name}>
                                                                路径
                                                                <RequiredMark />
                                                            </FieldLabel>
                                                            <FieldContent>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value ?? ""}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) =>
                                                                        field.handleChange(e.target.value)
                                                                    }
                                                                    aria-invalid={isInvalid}
                                                                    placeholder={
                                                                        isLink
                                                                            ? "https://example.com"
                                                                            : "/admin/example"
                                                                    }
                                                                    autoComplete="off"
                                                                    className="font-mono"
                                                                />
                                                            </FieldContent>
                                                            {isInvalid ? (
                                                                <FieldError errors={field.state.meta.errors} />
                                                            ) : (
                                                                <FieldDescription>
                                                                    {isLink
                                                                        ? "仅支持 http/https 外链"
                                                                        : "内部路径须为 /a/b 形式"}
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
                                                        !field.state.meta.isValid &&
                                                        field.state.meta.isTouched;
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
                                                                        field.handleChange(
                                                                            value ? String(value) : undefined,
                                                                        );
                                                                    }}
                                                                >
                                                                    <SelectTrigger
                                                                        id={field.name}
                                                                        className="w-full"
                                                                    >
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
                                                                    仅可选分组或目录，留空则为根级
                                                                </FieldDescription>
                                                            )}
                                                        </Field>
                                                    );
                                                }}
                                            />
                                        </FieldGroup>
                                    </FieldSet>
                                </>
                            ) : null
                        }
                    </form.Subscribe>

                    <FieldSeparator />

                    <FieldSet>
                        <FieldLegend>展示设置</FieldLegend>
                        <FieldDescription>
                            图标与排序只影响侧栏展示，不影响访问权限。
                        </FieldDescription>
                        <FieldGroup>
                            <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
                                <form.Field
                                    name="icon"
                                    children={(field) => {
                                        const Icon = resolveNavIcon(field.state.value);
                                        return (
                                            <Field>
                                                <FieldLabel htmlFor={field.name}>图标</FieldLabel>
                                                <FieldContent>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
                                                            {Icon ? (
                                                                <Icon className="size-4 text-foreground" />
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            value={field.state.value ?? ""}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target.value || undefined,
                                                                )
                                                            }
                                                            placeholder="如 Route、Folder"
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                </FieldContent>
                                                <FieldDescription>
                                                    Lucide 图标名，可留空
                                                </FieldDescription>
                                            </Field>
                                        );
                                    }}
                                />

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
                            </div>
                        </FieldGroup>
                    </FieldSet>

                    <FieldSeparator />

                    <FieldSet>
                        <FieldLegend>状态</FieldLegend>
                        <FieldGroup className="gap-3">
                            <form.Subscribe selector={(state) => state.values.routeType}>
                                {(routeType) =>
                                    routeType === "directory" ? (
                                        <form.Field
                                            name="defaultOpen"
                                            children={(field) => (
                                                <ToggleRow
                                                    id={field.name}
                                                    name={field.name}
                                                    label="默认展开"
                                                    description="进入后台时，该目录在侧栏中默认打开"
                                                    checked={Boolean(field.state.value)}
                                                    onBlur={field.handleBlur}
                                                    onChange={field.handleChange}
                                                />
                                            )}
                                        />
                                    ) : null
                                }
                            </form.Subscribe>
                            <form.Field
                                name="isActive"
                                children={(field) => (
                                    <ToggleRow
                                        id={field.name}
                                        name={field.name}
                                        label="启用"
                                        description="关闭后列表与侧栏将不再显示该路由"
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
                                        保存后将返回路由列表并刷新侧栏。
                                    </p>
                                )}
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        nativeButton={false}
                                        disabled={isSubmitting}
                                        render={
                                            <Link href="/admin/system/router" />
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
