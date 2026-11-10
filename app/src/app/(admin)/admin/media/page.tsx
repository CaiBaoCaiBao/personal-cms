import { AdminMedia } from "@/components/admin/media";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={null}>
           <AdminMedia />
        </Suspense>
    )
}

// async function Prefetch() {
//     await io();
//     const queryClient = new QueryClient();
//     const [data] = await Promise.all([
//         queryClient.query(MediaQuery.pagination({}, {
//             pageIndex: 0,
//             pageSize: MEDIA_FILE_PAGE_SIZE,
//         })),
//         queryClient.query(MediaQuery.categories()),
//     ]);

//     return (
//         <HydrationBoundary state={dehydrate(queryClient)}>
//             <AdminMedia />
//         </HydrationBoundary>
//     )
// }