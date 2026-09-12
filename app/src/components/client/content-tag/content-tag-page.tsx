"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DialogDrawer } from "@/components/client/content-tag/dialog-drawer";
import { DetailDrawer } from "@/components/client/content-tag/detail-drawer";
import { usePage } from "@/hooks/content-tag/use-page";
import { useEditForm } from "@/hooks/content-tag/use-edit-form";
import { useId } from "react";
import { ContentTagTable } from "./content-tag-table";
import { ContentTagTableColumn } from "./content-tag-table-column";
import { PageQueryDto } from "@/lib/schema/content-tag.schema";
import { PageOptions } from "@/type/content-tag.type";
import { Search } from "lucide-react";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon
} from "@/components/ui/input-group";
import { Pagination } from "@/components/client/pagination";

interface Props {
    params: PageQueryDto;
}

export function ContentTagPage({ params }: Props) {
    const pageOptions: PageOptions = {
        params,
    };
    const [state, actions, data] = usePage(pageOptions);
    const form = useEditForm({
        id: state.editTag?.id,
        initialData: state.editTag,
        open: state.openEditForm,
        onSuccess: () => {
            actions.setOpenEditForm(false);
        },
    });
    const formId = `edit-tag-form-${useId()}`;
    const columns = useMemo(
        () =>
            ContentTagTableColumn({
                onEdit: actions.openEdit,
                onDetail: (row) => {
                    actions.setOpenDetailDrawer(true);
                    actions.setDetailRow(row);
                },
            }),
        [],
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-2">
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={state.keyword}
                        placeholder="Enter keyword to search tag name and slug"
                        onChange={(e) => actions.setKeyword(e.target.value)}
                    />
                </InputGroup>
                <Button onClick={actions.openCreate} className="w-full sm:w-auto">
                    Create Tag
                </Button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
                <ContentTagTable
                    data={data.list}
                    columns={columns}
                />
                <Pagination
                    pageNumber={state.pageNumber}
                    pageSize={state.pageSize}
                    total={data.total}
                    onPageChange={actions.setPageNumber}
                />
            </div>
            <DialogDrawer
                open={state.openEditForm}
                onOpenChange={actions.setOpenEditForm}
                tag={state.editTag}
                formId={formId}
                form={form}
            />
            <DetailDrawer
                row={state.detailRow}
                open={state.detailDrawerOpen}
                pending={state.deleting}
                error={state.deleteError}
                onOpenChange={actions.setOpenDetailDrawer}
                onDelete={actions.confirmDelete}
            />
        </div>
    );
}
