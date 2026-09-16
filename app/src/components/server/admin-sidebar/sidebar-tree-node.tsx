import {
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { AdminSidebarItem } from "./sidebar-item";
import { SidebarDirectory } from "./sidebar-directory";
import Link from "next/link";
import type { AdminSidebarChild } from "@/config/admin-sidebar.constant";

interface Props {
    node: AdminSidebarChild;
    nested?: boolean;
}

export function SidebarTreeNode({ node, nested = false }: Props) {
    if (node.type === "directory") {
        const Icon = node.icon;
        return (
            <SidebarDirectory
                nested={nested}
                trigger={
                    <>
                        {Icon && <Icon />}
                        <span>{node.label}</span>
                    </>
                }
            >
                {node.children.map((child) => (
                    <SidebarTreeNode key={child.id} node={child} nested />
                ))}
            </SidebarDirectory>
        );
    }

    if (nested) {
        const Icon = node.icon;
        return (
            <SidebarMenuSubItem>
                <SidebarMenuSubButton render={<Link href={node.href} />}>
                    {Icon && <Icon />}
                    <span>{node.label}</span>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        );
    }

    return <AdminSidebarItem href={node.href} icon={node.icon} label={node.label} />;
}
