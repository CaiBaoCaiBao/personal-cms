"use client";
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
import { ContentTagItemVO } from "@/type/content-tag.type";
import { Badge } from "@/components/ui/badge";
import { ContentTagActions } from "./content-tag-actions";

const checkboxClass =
    "size-4 rounded-[4px] border border-input accent-primary";

export const features = tableFeatures({
    columnFilteringFeature,
    rowSortingFeature,
    columnVisibilityFeature,
    rowSelectionFeature,
    rowExpandingFeature,
    expandedRowModel: createExpandedRowModel(),
});

const columnsHelper = createColumnHelper<typeof features, ContentTagItemVO>();
export type Column = ReturnType<typeof ContentTagTableColumn>;

interface Props {
    onEdit?: (row: ContentTagItemVO) => void;
    onDetail?: (row: ContentTagItemVO) => void;
}

export function ContentTagTableColumn({
    onEdit,
    onDetail,
}: Props = {}) {
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
            cell: ({ getValue }) => (
                <span className="truncate font-medium">{getValue()}</span>
            ),
        }),
        columnsHelper.accessor("slug", {
            header: "标识",
            cell: ({ getValue }) => (
                <code className="rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {getValue()}
                </code>
            ),
        }),
        columnsHelper.accessor("isActive", {
            header: "状态",
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
        columnsHelper.display({
            id: "actions",
            header: () => <span className="sr-only">操作</span>,
            cell: ({ row }) => (
                <ContentTagActions
                    row={row.original}
                    onEdit={onEdit}
                    onDetail={onDetail}
                />
            ),
        }),
    ]);
}
