"use client";

import { useMemo } from "react";
import { SystemRouterTable } from "./system-router-table";
import { SystemRouterTableColumn } from "@/components/client/system-router/system-router-table-column";
import { usePage } from "@/hooks/system-router/use-page";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { DeleteDrawer } from "./delete-drawer";
import { Spinner } from "@/components/ui/spinner";
import { ListSystemRouterQueryDTO } from "@/lib/schema/system-router.schema";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

interface Props {
    params: ListSystemRouterQueryDTO;
}

export function SystemRouterPage({ params }: Props) {
    const [state, actions, data] = usePage({ params });
    const columns = useMemo(
        () =>
            SystemRouterTableColumn({
                onDelete: (row) => {
                    actions.setDeleteDrawerOpen(true);
                    actions.setDeleteRow(row);
                },
                isActive: state.isActive,
                onIsActiveChange: actions.setIsActive,
                scope: state.scope,
                onScopeChange: actions.setScope,
            }),
        [state.isActive, state.scope],
    );
    return (
        <div>
            <div className="flex sm:flex-row flex-col items-center gap-2">
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={state.keyword}
                        placeholder="搜索名称或路径"
                        onChange={(e) => actions.setKeyword(e.target.value)}
                    />
                </InputGroup>
                <Button
                    nativeButton={false}
                    size="sm"
                    render={<Link href="/admin/system/router/edit" />}
                    className="sm:w-auto w-full"
                >
                    <Plus />
                    新增
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={actions.handleRefreshRouter}
                    disabled={state.refreshing}
                    className="sm:w-auto w-full"
                >
                    {state.refreshing ? (<>
                        <Spinner /> Refreshing...
                    </>) : (<>
                        <RefreshCcw /> Refresh Navigation
                    </>)}

                </Button>
            </div>
            <div className="mt-4">
                <SystemRouterTable
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
