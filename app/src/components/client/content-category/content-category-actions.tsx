"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { ContentCategoryTreeNode } from "@/type/content-category.type";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface Props {
    row: ContentCategoryTreeNode;
    onDelete?: (row: ContentCategoryTreeNode) => void;
}

export function ContentCategoryActions({ row, onDelete }: Props) {
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
                        render={
                            <Link
                                href={`/admin/content/category/edit?id=${encodeURIComponent(row.id)}`}
                                scroll={false}
                            />
                        }
                    >
                        编辑
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        disabled={!onDelete}
                        onClick={() => onDelete?.(row)}
                    >
                        删除
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
