"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { AdminNavItem } from "@/type/system-router.type";
import { resolveNavIcon } from "../server/nav-icon";
import { usePathname } from "next/navigation";

interface Props {
    item: AdminNavItem;
    /** 是否在 SidebarMenuSub 内渲染 */
    isSub?: boolean;
}

export function AdminSidebarItem({ item, isSub = false }: Props) {
    const hasChildren =
        item.routeType === "directory" && Boolean(item.children?.length);
    const Icon = resolveNavIcon(item.icon);
    const pathname = usePathname();
    const isActive = pathname === item.path;
    const [open, setOpen] = useState(() => item.defaultOpen ?? false);

    useEffect(() => {
        setOpen(item.defaultOpen ?? false);
    }, [item.defaultOpen]);

    const button = (
        <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            render={
                !item.path
                    ? undefined
                    : item.routeType === "link"
                        ? (
                            <a
                                href={item.path}
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        )
                        : (
                            <Link href={item.path} />
                        )
            }
        >
            {Icon ? <Icon /> : null}
            <span>{item.title}</span>
        </SidebarMenuButton>
    );

    if (!hasChildren) {
        if (isSub) {
            return <SidebarMenuSubItem>{button}</SidebarMenuSubItem>;
        }
        return <SidebarMenuItem>{button}</SidebarMenuItem>;
    }

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="group/collapsible"
        >
            {isSub ? (
                <SidebarMenuSubItem>
                    {button}
                    <CollapsibleTrigger
                        render={
                            <SidebarMenuAction className="data-panel-open:rotate-90" />
                        }
                    >
                        <ChevronRight />
                        <span className="sr-only">展开</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {item.children!.map((child) => (
                                <AdminSidebarItem
                                    key={child.id}
                                    item={child}
                                    isSub
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuSubItem>
            ) : (
                <SidebarMenuItem>
                    {button}
                    <CollapsibleTrigger
                        render={
                            <SidebarMenuAction className="data-panel-open:rotate-90" />
                        }
                    >
                        <ChevronRight />
                        <span className="sr-only">展开</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {item.children!.map((child) => (
                                <AdminSidebarItem
                                    key={child.id}
                                    item={child}
                                    isSub
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            )}
        </Collapsible>
    );
}
