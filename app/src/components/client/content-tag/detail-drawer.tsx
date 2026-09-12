"use client";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import type { ContentTagItemVO } from "@/type/content-tag.type";
import { useIsMobile } from "@/hooks/use-mobile";
import { Spinner } from "@/components/ui/spinner";
import type { ReactNode } from "react";

interface Props {
    row: ContentTagItemVO | null;
    open: boolean;
    pending?: boolean;
    error?: string | null;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

function StatusBadge({ active }: { active: boolean }) {
    if (active) {
        return (
            <Badge
                variant="secondary"
                className="shrink-0 border-transparent bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-300"
            >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                启用
            </Badge>
        );
    }
    return (
        <Badge
            variant="outline"
            className="shrink-0 font-normal text-muted-foreground"
        >
            <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            停用
        </Badge>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="grid grid-cols-[4.5rem_1fr] items-start gap-3 px-1 py-3">
            <dt className="pt-0.5 text-xs text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-sm leading-relaxed">{children}</dd>
        </div>
    );
}

export function DetailDrawer({
    row,
    open,
    pending = false,
    error,
    onOpenChange,
    onDelete,
}: Props) {
    const isMobile = useIsMobile();
    if (!row) return null;

    const initial = row.name.trim().slice(0, 1) || "#";
    const description = row.description?.trim();

    return (
        <Drawer
            open={open}
            onOpenChange={(nextOpen) => {
                if (pending && !nextOpen) return;
                onOpenChange(nextOpen);
            }}
            showSwipeHandle={isMobile}
            swipeDirection={isMobile ? "down" : "right"}
        >
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <div className="flex items-start gap-3">
                        <span
                            aria-hidden
                            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary"
                        >
                            {initial}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2">
                                <DrawerTitle className="min-w-0 flex-1 truncate">
                                    {row.name}
                                </DrawerTitle>
                                <StatusBadge active={row.isActive} />
                            </div>
                            <DrawerDescription className="font-mono text-xs">
                                {row.slug}
                            </DrawerDescription>
                        </div>
                    </div>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
                    <dl className="divide-y divide-border/70">
                        <Field label="名称">{row.name}</Field>
                        <Field label="标识">
                            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                                {row.slug}
                            </code>
                        </Field>
                        <Field label="状态">
                            <StatusBadge active={row.isActive} />
                        </Field>
                        <Field label="描述">
                            {description ? (
                                <p className="whitespace-pre-wrap text-foreground/90">
                                    {description}
                                </p>
                            ) : (
                                <span className="text-muted-foreground">
                                    未填写
                                </span>
                            )}
                        </Field>
                    </dl>
                </div>

                {error ? (
                    <p className="px-4 pb-1 text-sm text-destructive">{error}</p>
                ) : null}

                <Separator />
                <DrawerFooter className="flex-row gap-2 pt-3">
                    <DrawerClose
                        className="flex-1"
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pending}
                                className="w-full"
                            >
                                关闭
                            </Button>
                        }
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={onDelete}
                        className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        {pending ? (
                            <>
                                <Spinner />
                                删除中...
                            </>
                        ) : (
                            <>
                                <Trash2 />
                                删除
                            </>
                        )}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
