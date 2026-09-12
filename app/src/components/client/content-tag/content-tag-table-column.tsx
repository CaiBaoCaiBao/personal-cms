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
            cell: ({ getValue }) => (
                <span className="font-medium">{getValue()}</span>
            ),
        }),
        columnsHelper.accessor("slug", {
            header: "Slug",
            cell: ({ getValue }) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {getValue()}
                </span>
            ),
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
        columnsHelper.display({
            id: "actions",
            header: "操作",
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
