/**
 * 管理端头部组件
 */
"use client";
import {
    createContext,
    useContext,
    useState
} from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const HeaderSlotContext = createContext<HTMLElement | null>(null);

export function AdminHeaderFrame({ children }: { children: React.ReactNode }) {
    const [slot, setSlot] = useState<HTMLElement | null>(null);

    return (
        <HeaderSlotContext.Provider value={slot}>
            <div className="grid h-svh grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
                <AdminHeader onSlot={setSlot} />
                {children}
            </div>
        </HeaderSlotContext.Provider>
    );
}

function AdminHeader({ onSlot }: { onSlot: (node: HTMLElement | null) => void }) {
    return (
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 !h-4 !self-center" />
            <div ref={onSlot} />
        </header>
    );
}

export function AdminHeaderSlot({ children, className }: { children: React.ReactNode, className?: string }) {
    const slot = useContext(HeaderSlotContext);
    if (!slot) return null;
    return createPortal(
        <div className={cn("flex min-w-0 flex-1 items-center gap-2", className)}>
            {children}
        </div>,
        slot
    );
}