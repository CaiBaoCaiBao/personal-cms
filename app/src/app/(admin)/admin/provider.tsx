import {
    SidebarProvider,
    SidebarInset
} from "@/components/ui/sidebar";
import { AdminHeaderFrame } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <AdminHeaderFrame >
                    {children}
                </AdminHeaderFrame>
            </SidebarInset>
        </SidebarProvider>
    )
}