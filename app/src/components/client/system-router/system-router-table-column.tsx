"use client";

import { SystemRouterTreeNode } from "@/type/system-router.type";
import {
    columnFilteringFeature,
    rowSortingFeature,
    tableFeatures,
    createColumnHelper,
    columnVisibilityFeature,
    rowSelectionFeature,
    rowExpandingFeature,
    createExpandedRowModel,
} from "@tanstack/react-table";
import {
    row_getCanExpand,
    row_getIsExpanded,
    row_getToggleExpandedHandler,
} from "@tanstack/react-table/static-functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveNavIcon } from "@/components/server/nav-icon";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SystemRouterActions } from "@/components/client/system-router/system-router-actions";

export const features = tableFeatures({
    columnFilteringFeature,
    rowSortingFeature,
    columnVisibilityFeature,
    rowSelectionFeature,
    rowExpandingFeature,
    expandedRowModel: createExpandedRowModel(),
});

const columnsHelper = createColumnHelper<typeof features, SystemRouterTreeNode>();
export type Column = ReturnType<typeof SystemRouterTableColumn>;

interface Props {
    onDelete?: (row: SystemRouterTreeNode) => void;
}

function formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("zh-CN", { hour12: false });
}

export function SystemRouterTableColumn({
    onDelete,
}: Props) {
    return columnsHelper.columns([
        columnsHelper.display({
            id: "select",
            header: ({ table }) => (
                <input
                    type="checkbox"
                    aria-label="全选"
                    checked={table.getIsAllRowsSelected()}
                    ref={(el) => {
                        if (el) {
                            el.indeterminate =
                                table.getIsSomeRowsSelected() &&
                                !table.getIsAllRowsSelected();
                        }
                    }}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    className="size-4 accent-primary"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    aria-label="选择行"
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                    className="size-4 accent-primary"
                />
            ),
        }),
        columnsHelper.accessor("name", {
            header: "名称",
            cell: ({ row }) => {
                const Icon = resolveNavIcon(row.original.icon);
                const canExpand = row_getCanExpand(row);
                const expanded = row_getIsExpanded(row);
                return (
                    <div
                        className="flex min-w-40 items-center gap-1"
                        style={{ paddingLeft: `${row.depth * 1.25}rem` }}
                    >
                        {canExpand ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={expanded ? "折叠" : "展开"}
                                onClick={row_getToggleExpandedHandler(row)}
                            >
                                {expanded ? (
                                    <ChevronDown />
                                ) : (
                                    <ChevronRight />
                                )}
                            </Button>
                        ) : (
                            <span className="inline-block size-6 shrink-0" />
                        )}
                        {Icon ? (
                            <Icon className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                            <span className="size-4 shrink-0" />
                        )}
                        <span className="font-medium">{row.original.name}</span>
                    </div>
                );
            },
        }),
        columnsHelper.accessor("path", {
            header: "路径",
            cell: ({ getValue }) => {
                const path = getValue();
                return (
                    <span className="font-mono text-xs text-muted-foreground">
                        {path ?? "—"}
                    </span>
                );
            },
        }),
        columnsHelper.accessor("routeTypeLabel", {
            header: "类型",
            cell: ({ getValue }) => (
                <Badge variant="secondary">{getValue()}</Badge>
            ),
        }),
        columnsHelper.accessor("sortOrder", {
            header: "排序",
            cell: ({ getValue }) => (
                <span className="tabular-nums">{getValue()}</span>
            ),
        }),
        columnsHelper.accessor("defaultOpen", {
            header: "默认展开",
            cell: ({ getValue }) => (getValue() ? "是" : "否"),
        }),
        columnsHelper.accessor("isActive", {
            header: "状态",
            cell: ({ getValue }) =>
                getValue() ? (
                    <Badge variant="default">启用</Badge>
                ) : (
                    <Badge variant="outline">停用</Badge>
                ),
        }),
        columnsHelper.accessor("updatedAt", {
            header: "更新时间",
            cell: ({ getValue }) => (
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateTime(getValue())}
                </span>
            ),
        }),
        columnsHelper.display({
            id: "actions",
            header: "操作",
            cell: ({ row }) => (
                <SystemRouterActions
                    row={row.original}
                    onDelete={onDelete}
                />
            ),
        }),
    ]);
}
