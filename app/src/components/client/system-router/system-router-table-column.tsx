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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveNavIcon } from "@/components/server/nav-icon";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SystemRouterActions } from "@/components/client/system-router/system-router-actions";
import type { RouteType } from "@/type/system-router.type";
import { cn } from "cn";

const checkboxClass =
    "size-4 rounded-[4px] border border-input accent-primary";

const TYPE_BADGE_CLASS: Record<RouteType, string> = {
    group: "bg-muted text-muted-foreground",
    directory: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    page: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    link: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

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
    isActive?: boolean;
    onIsActiveChange?: (isActive: boolean | undefined) => void;
}

function StatusColumnHeader({
    value,
    onChange,
}: {
    value?: boolean;
    onChange?: (isActive: boolean | undefined) => void;
}) {
    const selected = value === undefined ? "all" : value ? "true" : "false";
    const filtered = value !== undefined;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="-ml-1.5 h-7 gap-1 px-1.5 font-medium"
                    />
                }
            >
                状态
                <ChevronDown className="size-3.5 text-muted-foreground" />
                {filtered ? (
                    <span
                        aria-hidden
                        className="size-1.5 rounded-full bg-primary"
                    />
                ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                    value={selected}
                    onValueChange={(next) => {
                        if (next === "true") onChange?.(true);
                        else if (next === "false") onChange?.(false);
                        else onChange?.(undefined);
                    }}
                >
                    <DropdownMenuRadioItem value="all">全部</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="true">启用</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="false">停用</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("zh-CN", { hour12: false });
}

export function SystemRouterTableColumn({
    onDelete,
    isActive,
    onIsActiveChange,
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
                    className={checkboxClass}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    aria-label="选择行"
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                    className={checkboxClass}
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
                        className="flex min-w-40 items-center gap-1.5"
                        style={{ paddingLeft: `${row.depth * 1.25}rem` }}
                    >
                        {canExpand ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={expanded ? "折叠" : "展开"}
                                onClick={row_getToggleExpandedHandler(row)}
                                className="text-muted-foreground"
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
                            <span className="size-4 shrink-0 rounded-md bg-muted/80" />
                        )}
                        <span className="truncate font-medium">
                            {row.original.name}
                        </span>
                    </div>
                );
            },
        }),
        columnsHelper.accessor("path", {
            header: "路径",
            cell: ({ getValue }) => {
                const path = getValue();
                if (!path) {
                    return <span className="text-muted-foreground/60">—</span>;
                }
                return (
                    <code className="rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {path}
                    </code>
                );
            },
        }),
        columnsHelper.accessor("routeTypeLabel", {
            header: "类型",
            cell: ({ row, getValue }) => (
                <Badge
                    variant="secondary"
                    className={cn(
                        "border-transparent font-normal",
                        TYPE_BADGE_CLASS[row.original.routeType],
                    )}
                >
                    {getValue()}
                </Badge>
            ),
        }),
        columnsHelper.accessor("sortOrder", {
            header: "排序",
            cell: ({ getValue }) => (
                <span className="tabular-nums text-muted-foreground">
                    {getValue()}
                </span>
            ),
        }),
        columnsHelper.accessor("defaultOpen", {
            header: "默认展开",
            cell: ({ getValue }) => (
                <span className="text-muted-foreground">
                    {getValue() ? "是" : "否"}
                </span>
            ),
        }),
        columnsHelper.accessor("isActive", {
            header: () => (
                <StatusColumnHeader
                    value={isActive}
                    onChange={onIsActiveChange}
                />
            ),
            cell: ({ getValue }) =>
                getValue() ? (
                    <Badge
                        variant="secondary"
                        className="border-transparent bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-300"
                    >
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        启用
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="font-normal text-muted-foreground"
                    >
                        <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                        停用
                    </Badge>
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
            header: () => <span className="sr-only">操作</span>,
            cell: ({ row }) => (
                <SystemRouterActions
                    row={row.original}
                    onDelete={onDelete}
                />
            ),
        }),
    ]);
}
