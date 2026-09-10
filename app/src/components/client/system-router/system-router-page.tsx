"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SystemRouterTable } from "./system-router-table";
import { SystemRouterTableColumn } from "@/components/client/system-router/system-router-table-column";
import { usePage } from "@/hooks/system-router/use-page";
import type { SystemRouterListQuery } from "@/type/system-router.type";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { systemRouterKeys } from "@/query/system-router.query";
import { DeleteDrawer } from "./delete-drawer";

interface Props {
    params: SystemRouterListQuery;
}

export function SystemRouterPage({ params }: Props) {
    const queryClient = useQueryClient();
    const [state, actions, data] = usePage({ params });
    const columns = useMemo(
        () =>
            SystemRouterTableColumn({
                onDelete: (row) => {
                    actions.setDeleteDrawerOpen(true);
                    actions.setDeleteRow(row);
                },
            }),
        [],
    );
    return (
        <div>
            <div>
                <Button
                    nativeButton={false}
                    size="sm"
                    render={<Link href="/admin/system/router/edit" />}
                >
                    <Plus />
                    新增
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        void queryClient.invalidateQueries({
                            queryKey: systemRouterKeys.nav(),
                        });
                    }}
                >
                    <RefreshCcw />
                    刷新侧栏
                </Button>
            </div>
            <SystemRouterTable
                data={data.list}
                columns={columns}
            />
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
