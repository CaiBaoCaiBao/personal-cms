import {
    LayoutDashboard,
    Image,
    type LucideIcon
} from "lucide-react";
import type { MatchModule } from "@/types/globals.type";

export type NavItemConfig = {
    id: string;
    label: string;
    icon?: LucideIcon;
    href: string;
    match: Exclude<MatchModule, "contain">;
}

export type NavGroupConfig = {
    id: string;
    label: string;
    icon?: LucideIcon;
    href?: string;
    match: Exclude<MatchModule, "contain">;
    children:NavItemConfig[]
}

export type AdminNavConfig = NavItemConfig | NavGroupConfig;

export function isNavGroup(item: AdminNavConfig): item is NavGroupConfig {
    return "children" in item;
}

export const adminNavCondif: AdminNavConfig[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
        match: "exact",
    },
    {
        id: "media",
        label: "Media Management",
        icon: Image,
        href: "/admin/media",
        match: "prefix",
    }
]