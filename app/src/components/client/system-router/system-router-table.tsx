"use client";
import { useTable } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SystemRouterTreeNode } from "@/type/system-router.type";
import {
    Column,
    features,
} from "@/components/client/system-router/system-router-table-column";
import { FolderTree } from "lucide-react";
import { cn } from "cn";

interface Props {
    data: SystemRouterTreeNode[];
    columns: Column;
}

const COLUMN_CLASS: Record<string, { head?: string; cell?: string }> = {
    select: { head: "w-10 px-3", cell: "w-10 px-3" },
    name: { head: "min-w-56", cell: "min-w-56" },
    path: { head: "min-w-40", cell: "min-w-40" },
    routeTypeLabel: { head: "w-24", cell: "w-24" },
    sortOrder: { head: "w-16 text-center", cell: "w-16 text-center" },
    defaultOpen: { head: "w-24", cell: "w-24" },
    isActive: { head: "w-28", cell: "w-28" },
    updatedAt: { head: "w-40", cell: "w-40" },
    actions: {
        head: "sticky right-0 z-10 w-14 bg-muted/80 text-right backdrop-blur-sm",
        cell: "sticky right-0 z-10 w-14 bg-card text-right group-hover:bg-muted/40 group-data-[state=selected]:bg-primary/5",
    },
};

export function SystemRouterTable({
    data,
    columns,
}: Props) {
    const table = useTable({
        features,
        columns,
        data,
        getRowId: (row) => row.id,
        getSubRows: (row) => row.children,
        enableExpanding: true,
        initialState: {
            expanded: true,
        },
    });
    const rows = table.getRowModel().rows;

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <Table>
                <TableHeader className="sticky top-0 z-20 bg-muted/70 backdrop-blur-sm [&_tr]:border-border/70">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="hover:bg-transparent"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className={cn(
                                        "h-11 px-3 text-xs tracking-wide text-muted-foreground",
                                        COLUMN_CLASS[header.column.id]?.head,
                                    )}
                                >
                                    {header.isPlaceholder ? null : (
                                        <table.FlexRender header={header} />
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {rows.length ? (
                        rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                data-depth={row.depth}
                                className={cn(
                                    "group border-border/60 hover:bg-muted/40 data-[state=selected]:bg-primary/5",
                                    row.depth > 0 && "bg-muted/15",
                                )}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={cn(
                                            "px-3 py-2.5",
                                            COLUMN_CLASS[cell.column.id]?.cell,
                                        )}
                                    >
                                        <table.FlexRender cell={cell} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow className="hover:bg-transparent">
                            <TableCell
                                colSpan={columns.length}
                                className="h-48"
                            >
                                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                                    <span className="flex size-11 items-center justify-center rounded-full bg-muted">
                                        <FolderTree className="size-5" />
                                    </span>
                                    <p className="text-sm font-medium text-foreground">
                                        暂无路由
                                    </p>
                                    <p className="text-xs">
                                        调整筛选条件，或新增一条系统路由
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
