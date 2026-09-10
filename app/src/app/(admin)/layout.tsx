import {
    dehydrate,
    HydrationBoundary,
    noop,
} from "@tanstack/react-query";
import { AdminProvider } from "@/provider/admin-provider";
import { SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/client/admin-sidebar";
import { AdminHeader } from "@/components/server/admin-header";
import { getQueryClient } from "@/hooks/use-query-client";
import { systemRouterNavQuery } from "@/query/system-router.query";
import { SystemRouterService } from "@/lib/service/system-router.service";

export default async function Layout({
    children,
}: {
    children: Readonly<React.ReactNode>
}) {
    const queryClient = getQueryClient();
    await queryClient
        .query({
            ...systemRouterNavQuery.nav(),
            queryFn: () => SystemRouterService.getSidebarNav(),
        })
        .catch(noop);

    return (
        <div className="[--header-height:calc(--spacing(14))]">
            <AdminProvider>
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <AdminHeader />
                    <div className="flex flex-1">
                        <AdminSidebar />
                        <SidebarInset className="p-2">
                            {children}
                        </SidebarInset>
                    </div>
                </HydrationBoundary>
            </AdminProvider>
        </div>
    );
}
