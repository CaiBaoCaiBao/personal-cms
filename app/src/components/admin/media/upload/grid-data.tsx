"use client";
import { FileMetadata } from "@/components/file-upload/type";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FileType } from "@/components/file-type";
import { getFileType, getFileTypeCategory } from "@/lib/utils";
import { MIME_FAMILIES } from "@/components/file-type/constant";
import { AspectRatio } from "@/components/ui/aspect-ratio";
interface Props {
    item: FileMetadata;
    onRemove: (id: string) => void;
}

export function GridData({ item, onRemove }: Props) {
    const fileType = getFileType(item.file.name);
    const category = getFileTypeCategory(fileType);
    const isImage = category === MIME_FAMILIES.image;
    return (
        <Card size="sm" className="w-full min-w-0 gap-0 overflow-hidden py-0">
            <AspectRatio ratio={4 / 3} className="relative bg-muted">
                {isImage ? (
                    <img
                        src={item.url}
                        alt={item.file.name}
                        className="absolute inset-0 size-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FileType type={fileType} size="xl" />
                    </div>
                )}
                {item.status !== "success" && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon-xs"
                        aria-label="Remove"
                        className="absolute top-2 right-2 bg-background/90 shadow-sm backdrop-blur-sm"
                        onClick={() => onRemove(item.id)}
                    >
                        <X />
                    </Button>
                )}
            </AspectRatio>
            <CardHeader className="min-w-0 py-(--card-spacing)">
                <CardTitle className="truncate text-sm font-medium">
                    {item.file.name}
                </CardTitle>
                <CardDescription className="text-xs">
                    {formatBytes(item.file.size)}
                </CardDescription>
            </CardHeader>
        </Card>
    )
}