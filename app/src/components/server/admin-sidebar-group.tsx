import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar";
import type { AdminNavGroup } from "@/type/system-router.type";
import { AdminSidebarItem } from "../client/admin-sidebar-item";

interface Props {
    group: AdminNavGroup;
}

export function AdminSidebarGroup({ group }: Props) {
    if (group.items.length === 0) return null;

    return (
        <SidebarGroup>
            {group.title ? (
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
                <SidebarMenu>
                    {group.items.map((item) => (
                        <AdminSidebarItem key={item.id} item={item} />
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
