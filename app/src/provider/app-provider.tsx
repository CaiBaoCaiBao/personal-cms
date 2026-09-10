"use client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getQueryClient } from "@/hooks/use-query-client";
import { QueryClientProvider } from "@tanstack/react-query";

export function AppProvider({
    children
}: {
    children: Readonly<React.ReactNode>
}) {
    const queryClient = getQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </QueryClientProvider>
    )
}
