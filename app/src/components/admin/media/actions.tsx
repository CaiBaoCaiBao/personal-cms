"use client";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    Trash,
    Download
} from "lucide-react";
import { MediaFileList } from "@/types/media.type";

interface Props {
    item: MediaFileList,
    onRemove: (id: string) => void;
    className?: string;
}

export function MediaFileActions({ item, onRemove, className }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" className={className} />}
            >
                <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                >
                    <Download />  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onRemove(item.id)}
                    variant="destructive"
                >
                    <Trash />  Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

}