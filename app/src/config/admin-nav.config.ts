import { LayoutDashboard, type LucideIcon } from "lucide-react";
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

type AdminNavConfig = NavItemConfig | NavGroupConfig;

export const adminNavCondif: AdminNavConfig[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
        match: "exact",
    }
]