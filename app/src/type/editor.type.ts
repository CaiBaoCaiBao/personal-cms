import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";

export type MenuBarConfig = {
    group: string;
    children: (DropdownMenuConfig|ButtonMenuConfig)[];
};

export type DropdownMenuConfig = {
    id: string;
    label: string;
    icon: LucideIcon;
    items: ButtonMenuConfig[];
}

export type ButtonMenuConfig = {
    id: string;
    label: string;
    icon: LucideIcon;
    action: (editor: Editor) => void;
    disabled: (editor: Editor) => boolean;
    isActive: (editor: Editor) => boolean;
    className?: string;
    panel?: React.ComponentType<{
        editor: Editor;
        open: boolean;
        onOpenChange: (open: boolean) => void;
    }>;
}