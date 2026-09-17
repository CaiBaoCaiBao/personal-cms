import {
    SidebarProvider,
    SidebarInset
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/server/admin-sidebar";
export default function Layout({ children }: LayoutProps<"/">) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset className="min-h-screen px-2" >
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}