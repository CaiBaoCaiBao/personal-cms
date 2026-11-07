import {
    SidebarProvider,
    SidebarInset
} from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <AdminHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}