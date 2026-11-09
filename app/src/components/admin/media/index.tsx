"use client";
import { MediaQuery } from "@/query/media.query";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ViewMode } from "@/types/globals.type";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList } from "lucide-react";
import { GridData } from "./grid-data";
import { ListData } from "./list-data";
import { getFileType, getFileTypeCategory } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_NAMES } from "@/components/file-type/constant";
import type { FileTypeCategory } from "@/components/file-type/type";
import { MEDIA_FILE_PAGE_SIZE } from "@/constant/media.constant";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { MediaMutation } from "@/mutation/media.mutation";

function getPageItems(pageIndex: number, pageCount: number) {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, index) => index);
    }
    const items: Array<number | "ellipsis"> = [0];
    const start = Math.max(1, pageIndex - 1);
    const end = Math.min(pageCount - 2, pageIndex + 1);
    if (start > 1) items.push("ellipsis");
    for (let index = start; index <= end; index += 1) items.push(index);
    if (end < pageCount - 2) items.push("ellipsis");
    items.push(pageCount - 1);
    return items;
}

export function AdminMedia() {
    const [pageIndex, setPageIndex] = useState(0);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [category, setCategory] = useState<FileTypeCategory | null>(null);

    const { mutate: removeMediaFile, isPending: isDeleting } = useMutation({
        ...MediaMutation.remove(),
    })
    const { data, isPlaceholderData } = useQuery({
        ...MediaQuery.pagination({}, { pageIndex, pageSize: MEDIA_FILE_PAGE_SIZE }),
        placeholderData: keepPreviousData,
    });
    const { data: mimeTypes } = useQuery({
        ...MediaQuery.categories(),
        placeholderData: keepPreviousData,
    })

    const toggleViewMode = () => {
        setViewMode(viewMode === "grid" ? "list" : "grid");
    }
    const toggleCategory = (next: FileTypeCategory) => {
        setCategory((current) => current === next ? null : next);
    }
    const handleRemove = (id: string) => {
        removeMediaFile(id);
    }
    if (!data) return null;
    const pageCount = Math.ceil(data.total / MEDIA_FILE_PAGE_SIZE);
    const fileTypes = mimeTypes?.map((mimeType) => getFileType(mimeType));
    const categories = fileTypes?.map((fileType) => getFileTypeCategory(fileType));
    const uniqueCategories = [...new Set(categories)];
    const files = data.data;
    return (
        <div className="space-y-4">
            <div className="flex w-full flex-wrap items-center gap-2">
                {uniqueCategories.map((item) => (
                    <Badge
                        key={item}
                        variant={category === item ? "default" : "outline"}
                        render={<Button variant="ghost" size="xs" />}
                        onClick={() => toggleCategory(item)}
                    >
                        {CATEGORY_NAMES[item]}
                    </Badge>
                ))}
                <Button variant="outline" size="icon" className="ml-auto" onClick={toggleViewMode}>
                    {viewMode === "grid" ? <LayoutGrid /> : <LayoutList />}
                </Button>
            </div>
            <div>
                {viewMode === "grid" ? (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${isPlaceholderData ? "opacity-60" : ""}`}>
                        {files.map((item) => (
                            <GridData
                                key={item.id}
                                item={item}
                                onRemove={() => handleRemove(item.id)}
                                isDeleting={isDeleting}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={`space-y-2 ${isPlaceholderData ? "opacity-60" : ""}`}>
                        {files.map((item) => (
                            <ListData
                                key={item.id}
                                item={item}
                                onRemove={() => handleRemove(item.id)}
                            />
                        ))}
                    </div>
                )}
                {pageCount > 1 && (
                    <Pagination className="mt-4">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    aria-disabled={pageIndex === 0}
                                    className={pageIndex === 0 ? "pointer-events-none opacity-50" : undefined}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setPageIndex((current) => Math.max(0, current - 1));
                                    }}
                                />
                            </PaginationItem>
                            {getPageItems(pageIndex, pageCount).map((item, index) => (
                                item === "ellipsis" ? (
                                    <PaginationItem key={`ellipsis-${index}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={item}>
                                        <PaginationLink
                                            isActive={item === pageIndex}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setPageIndex(item);
                                            }}
                                        >
                                            {item + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    aria-disabled={pageIndex >= pageCount - 1}
                                    className={pageIndex >= pageCount - 1 ? "pointer-events-none opacity-50" : undefined}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setPageIndex((current) => Math.min(pageCount - 1, current + 1));
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    )
}