import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar";
import { SidebarTreeNode } from "./sidebar-tree-node";
import { adminSidebarTree } from "@/config/admin-sidebar.constant";
import { AdminSidebarHeader } from "./sidebar-header";
export function AdminSidebar() {
    return (
        <Sidebar>
            <AdminSidebarHeader />
            <SidebarContent>
                {adminSidebarTree.map((node) => {
                    if (node.type === "group") {
                        return (
                            <SidebarGroup key={node.id}>
                                <SidebarGroupLabel>{node.label}</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {node.children.map((child) => (
                                            <SidebarTreeNode key={child.id} node={child} />
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        );
                    }

                    return (
                        <SidebarGroup key={node.id}>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarTreeNode node={node} />
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>
        </Sidebar>
    );
}
