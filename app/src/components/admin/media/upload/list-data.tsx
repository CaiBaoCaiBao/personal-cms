"use client";
import { FileMetadata } from "@/components/file-upload/type";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
    ItemMedia
} from "@/components/ui/item";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FileType } from "@/components/file-type";
import { getFileType, getFileTypeCategory } from "@/lib/utils";
import { MIME_FAMILIES } from "@/components/file-type/constant";

interface Props {
    item: FileMetadata;
    onRemove: (id: string) => void;
}

export function ListData({
    item,
    onRemove
}: Props) {
    const fileType = getFileType(item.file.name);
    const category = getFileTypeCategory(fileType);
    const isImage = category === MIME_FAMILIES.image;
    return (
        <Item variant="outline" className="flex-nowrap">
            <ItemMedia variant="image" className="size-12 bg-muted">
                {isImage ? (
                    <img src={item.url} alt={item.file.name} />
                ) : (
                    <FileType type={fileType} size="sm" />
                )}
            </ItemMedia>
            <ItemContent className="min-w-0">
                <ItemTitle className="w-full">{item.file.name}</ItemTitle>
                <ItemDescription className="text-xs">
                    {formatBytes(item.file.size)}
                </ItemDescription>
            </ItemContent>
            {item.status !== "success" && (
                <ItemActions>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        aria-label="Remove"
                        onClick={() => onRemove(item.id)}
                    >
                        <X />
                    </Button>
                </ItemActions>
            )}
        </Item>
    )
}