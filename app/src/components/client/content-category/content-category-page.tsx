"use client";

import { useMemo } from "react";
import { ContentCategoryTable } from "./content-category-table";
import { ContentCategoryTableColumn } from "@/components/client/content-category/content-category-table-column";
import { usePage } from "@/hooks/content-category/use-page";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { DeleteDrawer } from "./delete-drawer";
import { ListContentCategoryQueryDTO } from "@/lib/schema/content-category.schema";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";

interface Props {
    params: ListContentCategoryQueryDTO;
}

export function ContentCategoryPage({ params }: Props) {
    const [state, actions, data] = usePage({ params });
    const columns = useMemo(
        () =>
            ContentCategoryTableColumn({
                onDelete: (row) => {
                    actions.setDeleteDrawerOpen(true);
                    actions.setDeleteRow(row);
                },
                isActive: state.isActive,
                onIsActiveChange: actions.setIsActive,
            }),
        [state.isActive],
    );

    return (
        <div>
            <div className="flex flex-col items-center gap-2 sm:flex-row">
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={state.keyword}
                        placeholder="搜索名称或标识"
                        onChange={(e) => actions.setKeyword(e.target.value)}
                    />
                </InputGroup>
                <Button
                    nativeButton={false}
                    size="sm"
                    render={<Link href="/admin/content/category/edit" />}
                    className="w-full sm:w-auto"
                >
                    <Plus />
                    新增
                </Button>
            </div>
            <div className="mt-4">
                <ContentCategoryTable
                    data={data.list}
                    columns={columns}
                />
            </div>
            <DeleteDrawer
                row={state.deleteRow}
                open={state.deleteDrawerOpen}
                pending={state.deleting}
                error={state.deleteError}
                onOpenChange={actions.setDeleteDrawerOpen}
                onDelete={actions.confirmDelete}
            />
        </div>
    );
}
