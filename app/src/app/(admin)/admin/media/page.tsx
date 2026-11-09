import { AdminMedia } from "@/components/admin/media";
import { io } from "next/cache";
import {
    QueryClient,
    dehydrate,
    HydrationBoundary
} from "@tanstack/react-query";
import { Suspense } from "react";
import { MediaQuery } from "@/query/media.query";
import { MEDIA_FILE_PAGE_SIZE } from "@/constant/media.constant";
import { AdminHeaderSlot } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getFileType, getFileTypeCategory } from "@/lib/utils";

export default function Page() {
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
            </AdminHeaderSlot>
            <Suspense fallback={null}>
                <Prefetch />
            </Suspense>
        </>

    )
}

async function Prefetch() {
    await io();
    const queryClient = new QueryClient();
    const [data] = await Promise.all([
        queryClient.query(MediaQuery.pagination({}, {
            pageIndex: 0,
            pageSize: MEDIA_FILE_PAGE_SIZE,
        })),
        queryClient.query(MediaQuery.categories()),
    ]);

    if (!data) return null;
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminMedia />
        </HydrationBoundary>
    )
}