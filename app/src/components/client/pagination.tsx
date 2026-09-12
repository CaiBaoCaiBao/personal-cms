"use client";
import {
    Pagination as PaginationComponent,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface Props {
    pageNumber: number;
    pageSize: number;
    total: number;
    onPageChange: (pageNumber: number) => void;
}
export function Pagination({
    pageNumber,
    pageSize,
    total,
    onPageChange,
}: Props) {
    const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
    const current = Math.min(Math.max(pageNumber, 1), pageCount);
    if (total === 0) return null;

    const rangeStart = (current - 1) * pageSize + 1;
    const rangeEnd = Math.min(current * pageSize, total);
    const pages = getVisiblePages(current, pageCount);
    const atFirst = current <= 1;
    const atLast = current >= pageCount;

    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card px-3 py-2.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="order-last text-center text-xs tabular-nums text-muted-foreground sm:order-first sm:text-left">
                {rangeStart}–{rangeEnd} / 共 {total} 条
            </p>
            <PaginationComponent className="mx-0 w-auto">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            text="上一页"
                            aria-disabled={atFirst}
                            tabIndex={atFirst ? -1 : undefined}
                            className={cn(
                                "h-8 cursor-pointer",
                                atFirst && "pointer-events-none opacity-50",
                            )}
                            onClick={() => !atFirst && onPageChange(current - 1)}
                        />
                    </PaginationItem>

                    {pages.map((page, index) =>
                        page === "ellipsis" ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={current === page}
                                    className="size-8 cursor-pointer"
                                    onClick={() => onPageChange(page)}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ),
                    )}

                    <PaginationItem>
                        <PaginationNext
                            text="下一页"
                            aria-disabled={atLast}
                            tabIndex={atLast ? -1 : undefined}
                            className={cn(
                                "h-8 cursor-pointer",
                                atLast && "pointer-events-none opacity-50",
                            )}
                            onClick={() => !atLast && onPageChange(current + 1)}
                        />
                    </PaginationItem>
                </PaginationContent>
            </PaginationComponent>
        </div>
    );
}

function getVisiblePages(current: number, pageCount: number): Array<number | "ellipsis"> {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(pageCount - 1, current + 1);
    const pages: Array<number | "ellipsis"> = [1];

    if (start > 2) pages.push("ellipsis");
    for (let page = start; page <= end; page++) pages.push(page);
    if (end < pageCount - 1) pages.push("ellipsis");
    pages.push(pageCount);

    return pages;
}
