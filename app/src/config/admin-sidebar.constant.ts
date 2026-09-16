import type { LucideIcon } from "lucide-react";
import { Folder, LayoutDashboard, User } from "lucide-react";

type AdminSidebarNodeBase = {
    id: string;
    icon?: LucideIcon;
    label: string;
};

export type AdminSidebarItemNode = AdminSidebarNodeBase & {
    type: "item";
    href: string;
};

export type AdminSidebarDirectoryNode = AdminSidebarNodeBase & {
    type: "directory";
    children: AdminSidebarChild[];
};

export type AdminSidebarGroupNode = AdminSidebarNodeBase & {
    type: "group";
    children: AdminSidebarChild[];
};

export type AdminSidebarChild = AdminSidebarItemNode | AdminSidebarDirectoryNode;

export type AdminSidebarTree = AdminSidebarChild | AdminSidebarGroupNode;

export const adminSidebarTree: AdminSidebarTree[] = [
    {
        id: "dashboard",
        href: "/admin",
        type: "item",
        icon: LayoutDashboard,
        label: "Dashboard",
    }
];
