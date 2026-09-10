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
import { ROUTE_TYPE_LABEL } from "@/constant/system-router.constant";
import { resolveNavIcon } from "@/components/server/nav-icon";
import Link from "next/link";

interface Props {
    id?: string;
    parentRouters: SystemRouterParentOption[];
}

const PARENT_NONE = "";

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
    const form = useSystemRouterForm({ options });
    const parentItems = [
        { value: PARENT_NONE, label: "无（根级）" },
        ...parentRouters.map((item) => ({
            value: item.id,
            label: item.path ? `${item.name}（${item.path}）` : item.name,
        })),
    ];

    if (id && isPending) {
        return <div className="text-sm text-muted-foreground">加载中…</div>;
    }
    if (id && isError) {
        return <div className="text-sm text-destructive">路由不存在或加载失败</div>;
    }

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <div>
                <h1 className="text-lg font-medium">
                    {id ? "编辑路由" : "新增路由"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    按类型填写路径与父级，分组只能作为根节点。
                </p>
            </div>
            <form
                id={formId}
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
                className="flex flex-col gap-6"
            >
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
                                        <span className="text-red-500">*</span>
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
                                        <FieldDescription>侧栏和列表中显示的名称</FieldDescription>
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
                                        <span className="text-red-500">*</span>
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
                                            分组无路径；目录可默认展开；外链填写 URL
                                        </FieldDescription>
                                    )}
                                </Field>
                            );
                        }}
                    />

                    <form.Subscribe selector={(state) => state.values.routeType}>
                        {(routeType) => (
                            <>
                                {routeType !== "group" ? (
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
                                                        <span className="text-red-500">*</span>
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
                                ) : null}

                                {routeType !== "group" ? (
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
                                                            仅可选分组或目录
                                                        </FieldDescription>
                                                    )}
                                                </Field>
                                            );
                                        }}
                                    />
                                ) : null}

                                {routeType === "directory" ? (
                                    <form.Field
                                        name="defaultOpen"
                                        children={(field) => (
                                            <Field orientation="horizontal">
                                                <FieldLabel htmlFor={field.name}>
                                                    默认展开
                                                </FieldLabel>
                                                <FieldContent>
                                                    <input
                                                        id={field.name}
                                                        name={field.name}
                                                        type="checkbox"
                                                        checked={Boolean(field.state.value)}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.checked)
                                                        }
                                                        className="size-4 accent-primary"
                                                    />
                                                </FieldContent>
                                            </Field>
                                        )}
                                    />
                                ) : null}
                            </>
                        )}
                    </form.Subscribe>

                    <form.Field
                        name="icon"
                        children={(field) => {
                            const Icon = resolveNavIcon(field.state.value);
                            return (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>图标</FieldLabel>
                                    <FieldContent>
                                        <div className="flex items-center gap-2">
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
                                            {Icon ? (
                                                <Icon className="size-4 shrink-0 text-muted-foreground" />
                                            ) : null}
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
                                            同级数字越小越靠前
                                        </FieldDescription>
                                    )}
                                </Field>
                            );
                        }}
                    />

                    <form.Field
                        name="isActive"
                        children={(field) => (
                            <Field orientation="horizontal">
                                <FieldLabel htmlFor={field.name}>启用</FieldLabel>
                                <FieldContent>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type="checkbox"
                                        checked={Boolean(field.state.value)}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.checked)
                                        }
                                        className="size-4 accent-primary"
                                    />
                                </FieldContent>
                            </Field>
                        )}
                    />
                </FieldGroup>

                <div className="flex items-center gap-2">
                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                            >
                                {isSubmitting
                                    ? "提交中…"
                                    : id
                                        ? "保存"
                                        : "创建"}
                            </Button>
                        )}
                    </form.Subscribe>
                    <Button
                        type="button"
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/admin/system/router" />}
                    >
                        取消
                    </Button>
                </div>
            </form>
        </div>
    );
}
