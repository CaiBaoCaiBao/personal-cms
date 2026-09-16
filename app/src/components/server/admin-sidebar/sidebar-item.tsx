import {
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
    href: string;
    icon?: LucideIcon;
    label: string;
}

export function AdminSidebarItem({ href, icon, label }: Props) {
    const Icon = icon;
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                render={<Link href={href} />}
            >
                {Icon && <Icon />}
                {label}
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}