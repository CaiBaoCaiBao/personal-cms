"use client";
import { AdminHeaderSlot } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
} from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/use-debounce";

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
    const [search, setSearch] = useState("");
    const [keyword, setKeyword] = useState("");
    const { debouncedFn } = useDebounce((value: string) => {
        setKeyword(value);
    }, 300);

    return (
        <>
            <AdminHeaderSlot>
                <Button
                    nativeButton={false}
                    render={<Link href="/admin/media/upload" />}
                    size="sm"
                >
                    Upload
                </Button>
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            debouncedFn(event.target.value);
                        }}
                        placeholder="Search"
                    />
                </InputGroup>
            </AdminHeaderSlot>
            <div className="space-y-4">
                {keyword}
            </div>
        </>
    )
}