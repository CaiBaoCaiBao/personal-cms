"use client";

import { usePathname } from "next/navigation";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
} from "@/components/ui/sidebar";
import { adminNavCondif, isNavGroup } from "@/config/admin-nav.config";
import { AdminSidebarNavGroup } from "./admin-sidebar-nav-group";
import { AdminSidebarNavItem } from "./admin-sidebar-nav-item";
import { isNavGroupActive, isNavItemActive } from "./is-nav-active";

export function AdminSidebarNav() {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {adminNavCondif.map((item) => {
                        if (isNavGroup(item)) {
                            return (
                                <AdminSidebarNavGroup
                                    key={item.id}
                                    group={item}
                                    pathname={pathname}
                                    active={isNavGroupActive(pathname, item)}
                                />
                            );
                        }
                        return (
                            <AdminSidebarNavItem
                                key={item.id}
                                item={item}
                                active={isNavItemActive(pathname, item)}
                            />
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
