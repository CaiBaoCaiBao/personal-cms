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
import { Trash2 } from "lucide-react";
import type { ContentCategoryTreeNode } from "@/type/content-category.type";
import { useIsMobile } from "@/hooks/use-mobile";
import { Spinner } from "@/components/ui/spinner";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item";
import { cn } from "cn";

interface Props {
    row: ContentCategoryTreeNode | null;
    open: boolean;
    pending?: boolean;
    error?: string | null;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

function countDescendants(node: ContentCategoryTreeNode): number {
    return (node.children ?? []).reduce(
        (total, child) => total + 1 + countDescendants(child),
        0,
    );
}

function ChildCategoryTree({
    nodes,
    depth = 0,
}: {
    nodes: ContentCategoryTreeNode[];
    depth?: number;
}) {
    return (
        <ul
            className={cn(
                "flex flex-col gap-1.5",
                depth > 0 && "mt-1.5 ml-2.5 border-l border-border/70 pl-2.5",
            )}
        >
            {nodes.map((node) => (
                <li key={node.id} className="min-w-0">
                    <div className="rounded-md bg-muted/50 px-2.5 py-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium leading-snug">
                                {node.name}
                            </span>
                            <Badge
                                variant="outline"
                                className={
                                    node.isActive
                                        ? "shrink-0 text-[10px] font-normal"
                                        : "shrink-0 text-[10px] font-normal text-muted-foreground"
                                }
                            >
                                {node.isActive ? "启用" : "停用"}
                            </Badge>
                        </div>
                        <p className="mt-0.5 truncate font-mono text-[11px] leading-normal text-muted-foreground">
                            {node.slug}
                        </p>
                    </div>
                    {node.children?.length ? (
                        <ChildCategoryTree nodes={node.children} depth={depth + 1} />
                    ) : null}
                </li>
            ))}
        </ul>
    );
}

export function DeleteDrawer({
    row,
    open,
    pending = false,
    error,
    onOpenChange,
    onDelete,
}: Props) {
    const isMobile = useIsMobile();
    if (!row) return null;

    const descendantCount = countDescendants(row);
    const children = row.children ?? [];

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
                <DrawerHeader>
                    <DrawerTitle>删除分类</DrawerTitle>
                    <DrawerDescription>
                        {descendantCount > 0
                            ? `确定删除「${row.name}」吗？此操作为不可逆操作，其下 ${descendantCount} 个子分类将一并删除。`
                            : `确定删除「${row.name}」吗？此操作为不可逆操作。`}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-3 px-4 py-3">
                    <Item variant="outline" size="sm">
                        <ItemContent>
                            <ItemTitle className="flex w-full max-w-full items-center justify-between gap-2">
                                <span className="truncate">{row.name}</span>
                                <Badge
                                    variant="outline"
                                    className="shrink-0 text-[10px] font-normal"
                                >
                                    {row.isActive ? "启用" : "停用"}
                                </Badge>
                            </ItemTitle>
                            <ItemDescription className="truncate font-mono text-[11px]">
                                {row.slug}
                            </ItemDescription>
                        </ItemContent>
                    </Item>
                    {children.length > 0 ? (
                        <div className="min-h-0 max-h-56 overflow-auto rounded-lg border border-border/60 bg-background p-2.5">
                            <p className="mb-2 px-0.5 text-xs font-medium text-muted-foreground">
                                将同时删除的子分类（{descendantCount}）
                            </p>
                            <ChildCategoryTree nodes={children} />
                        </div>
                    ) : null}
                </div>
                {error ? (
                    <p className="px-4 text-sm text-destructive">{error}</p>
                ) : null}
                <DrawerFooter>
                    <Button
                        variant="destructive"
                        disabled={pending}
                        onClick={onDelete}
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
                    <DrawerClose
                        render={
                            <Button variant="outline" disabled={pending}>
                                取消
                            </Button>
                        }
                    />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
