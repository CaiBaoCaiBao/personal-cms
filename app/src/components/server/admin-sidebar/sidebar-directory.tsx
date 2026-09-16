"use client";

import {
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
    nested?: boolean;
    trigger: ReactNode;
    children: ReactNode;
}

export function SidebarDirectory({ nested = false, trigger, children }: Props) {
    const Item = nested ? SidebarMenuSubItem : SidebarMenuItem;
    const TriggerButton = nested ? SidebarMenuSubButton : SidebarMenuButton;

    return (
        <Item>
            <Collapsible className="group/collapsible">
                <CollapsibleTrigger render={<TriggerButton />}>
                    {trigger}
                    <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>{children}</SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </Item>
    );
}
