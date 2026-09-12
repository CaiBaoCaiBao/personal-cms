"use client";

import { EditForm } from "@/hooks/content-tag/use-edit-form";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldContent,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

interface Props {
    form: EditForm;
    formId: string;
}

function RequiredMark() {
    return <span className="text-destructive">*</span>;
}

function toSlug(name: string) {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64);
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

export function EditTagForm({ form, formId }: Props) {
    return (
        <form
            id={formId}
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
            }}
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
                                    <RequiredMark />
                                </FieldLabel>
                                <FieldContent>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value ?? ""}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => {
                                            const next = e.target.value;
                                            field.handleChange(next);
                                        }}
                                        aria-invalid={isInvalid}
                                        placeholder="例如：前端"
                                        autoComplete="off"
                                    />
                                </FieldContent>
                                {isInvalid ? (
                                    <FieldError errors={field.state.meta.errors} />
                                ) : (
                                    <FieldDescription>列表与文章中显示的标签名</FieldDescription>
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
                                        value={field.state.value ?? ""}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="frontend"
                                        autoComplete="off"
                                        className="font-mono"
                                    />
                                </FieldContent>
                                {isInvalid ? (
                                    <FieldError errors={field.state.meta.errors} />
                                ) : (
                                    <FieldDescription>
                                        2–64 位，仅小写字母、数字与单个连字符
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
                                    <textarea
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value ?? ""}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="可选，说明该标签的用途"
                                        rows={3}
                                        className={cn(
                                            "w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
                                        )}
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

                <form.Field
                    name="isActive"
                    children={(field) => (
                        <ToggleRow
                            id={field.name}
                            name={field.name}
                            label="启用"
                            description="关闭后列表中将不再默认展示该标签"
                            checked={Boolean(field.state.value)}
                            onBlur={field.handleBlur}
                            onChange={field.handleChange}
                        />
                    )}
                />
            </FieldGroup>
        </form>
    );
}
