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
import type { SystemRouterTreeNode } from "@/type/system-router.type";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
    row: SystemRouterTreeNode | null;
    open: boolean;
    pending?: boolean;
    error?: string | null;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

function countDescendants(node: SystemRouterTreeNode): number {
    return (node.children ?? []).reduce(
        (total, child) => total + 1 + countDescendants(child),
        0,
    );
}

function ChildRouteTree({
    nodes,
    depth = 0,
}: {
    nodes: SystemRouterTreeNode[];
    depth?: number;
}) {
    return (
        <ul className="flex flex-col gap-1">
            {nodes.map((node) => (
                <li key={node.id}>
                    <div
                        className="flex min-w-0 items-center gap-2 py-0.5"
                        style={{ paddingLeft: `${depth * 1.25}rem` }}
                    >
                        <span className="truncate font-medium">{node.name}</span>
                        <Badge variant="outline">{node.routeTypeLabel}</Badge>
                        {node.path ? (
                            <span className="truncate text-xs text-muted-foreground">
                                {node.path}
                            </span>
                        ) : null}
                    </div>
                    {node.children?.length ? (
                        <ChildRouteTree nodes={node.children} depth={depth + 1} />
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
                    <DrawerTitle>删除路由</DrawerTitle>
                    <DrawerDescription>
                        {descendantCount > 0
                            ? `确定删除「${row.name}」吗？其下 ${descendantCount} 个子路由将一并软删除，列表与侧栏将不再显示。`
                            : `确定删除「${row.name}」吗？此操作为软删除，列表与侧栏将不再显示该路由。`}
                    </DrawerDescription>
                </DrawerHeader>
                {children.length > 0 ? (
                    <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
                        <p className="mb-2 text-xs text-muted-foreground">
                            将同时删除的子路由
                        </p>
                        <ChildRouteTree nodes={children} />
                    </div>
                ) : null}
                {error ? (
                    <p className="px-4 text-sm text-destructive">{error}</p>
                ) : null}
                <DrawerFooter>
                    <Button
                        variant="destructive"
                        disabled={pending}
                        onClick={onDelete}
                    >
                        <Trash2 />
                        {pending ? "删除中…" : "删除"}
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
