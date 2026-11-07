import Link from "next/link";
import {
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { NavItemConfig } from "@/config/admin-nav.config";

type AdminSidebarNavSubItemProps = {
    item: NavItemConfig;
    active: boolean;
};

export function AdminSidebarNavSubItem({ item, active }: AdminSidebarNavSubItemProps) {
    const Icon = item.icon;
    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton
                render={<Link href={item.href} />}
                isActive={active}
            >
                {Icon ? <Icon /> : null}
                <span>{item.label}</span>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}
