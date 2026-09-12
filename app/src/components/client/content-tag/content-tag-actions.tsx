"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { ContentTagItemVO } from "@/type/content-tag.type";
import { MoreHorizontal } from "lucide-react";

interface Props {
    row: ContentTagItemVO;
    onEdit?: (row: ContentTagItemVO) => void;
    onDetail?: (row: ContentTagItemVO) => void;
}

export function ContentTagActions({ row, onEdit, onDetail }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="操作"
                    />
                }
            >
                <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        disabled={!onEdit}
                        onClick={() => onEdit?.(row)}
                    >
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={!onDetail}
                        onClick={() => onDetail?.(row)}
                    >
                        Detail
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
