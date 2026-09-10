"use client";

import { useQuery } from "@tanstack/react-query";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { AdminSidebarGroup } from "@/components/server/admin-sidebar-group";
import { systemRouterNavQuery } from "@/query/system-router.query";

export function AdminSidebar() {
    const { data: nav = [] } = useQuery(systemRouterNavQuery.nav());

    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            variant="floating"
            collapsible="offcanvas"
        >
            <SidebarHeader>JuntL</SidebarHeader>
            <SidebarContent>
                {nav.map((group, groupIndex) => (
                    <AdminSidebarGroup
                        key={group.title ?? `sidebar-group-${groupIndex}`}
                        group={group}
                    />
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
