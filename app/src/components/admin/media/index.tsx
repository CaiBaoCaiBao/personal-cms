"use client";
import { MediaFileList } from "@/types/media.type";
import { MediaQuery } from "@/query/media.query";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ViewMode } from "@/types/globals.type";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList } from "lucide-react";
import { GridData } from "./grid-data";
import { ListData } from "./list-data";

interface Props {
    initialFiles: MediaFileList[];
    total: number;
    pageIndex: number;
    pageSize: number;
}

export function AdminMedia({
    initialFiles,
    total,
    pageIndex,
    pageSize
}: Props) {
    const { data, isLoading } = useQuery({
        ...MediaQuery.pagination({}, { pageIndex: 0, pageSize: 10 }),
        initialData: {
            data: initialFiles,
            total,
            pageIndex,
            pageSize,
        }
    })
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const toggleViewMode = () => {
        setViewMode(viewMode === "grid" ? "list" : "grid");
    }
    if (!data) return null;
    return (
        <div className="space-y-4">
            <div>
                <Button variant="outline" size="icon" onClick={toggleViewMode}>
                    {viewMode === "grid" ? <LayoutGrid /> : <LayoutList />}
                </Button>
            </div>
            <div>
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {data.data.map((item) => (
                            <GridData
                                key={item.id}
                                item={item}
                                onRemove={() => { }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {data.data.map((item) => (
                            <ListData
                                key={item.id}
                                item={item}
                                onRemove={() => { }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}