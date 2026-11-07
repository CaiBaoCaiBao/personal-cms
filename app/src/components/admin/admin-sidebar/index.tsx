import {
    Sidebar,
    SidebarContent,
} from "@/components/ui/sidebar";
import { AdminSidebarHeader } from "./admin-sidebar-header";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export function AdminSidebar() {
    return (
        <Sidebar variant="floating" collapsible="icon">
            <AdminSidebarHeader />
            <SidebarContent>
                <AdminSidebarNav />
            </SidebarContent>
        </Sidebar>
    );
}
