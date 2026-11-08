import { AdminMedia } from "@/components/admin/media";
import { io } from "next/cache";
import {
    QueryClient,
    dehydrate,
    HydrationBoundary
} from "@tanstack/react-query";
import { Suspense } from "react";
import { MediaQuery } from "@/query/media.query";
import { AdminHeaderSlot } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
    const data = (await queryClient.query(MediaQuery.pagination({}, { pageIndex: 0, pageSize: 10 }))) ?? {
        data: [],
        total: 0,
        pageIndex: 0,
        pageSize: 10,
    };
    if (!data) return null;
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminMedia
                initialFiles={data.data}
                total={data.total}
                pageIndex={data.pageIndex}
                pageSize={data.pageSize}
            />
        </HydrationBoundary>
    )
}