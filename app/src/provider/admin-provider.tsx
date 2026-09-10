import { SidebarProvider } from "@/components/ui/sidebar";

export function AdminProvider({
    children
}: { children: Readonly<React.ReactNode> }) {
    return (
        <SidebarProvider className="flex flex-col">
            {children}
        </SidebarProvider>
    )
}