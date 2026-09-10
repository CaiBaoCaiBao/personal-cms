import {
    dehydrate,
    HydrationBoundary,
    noop,
} from "@tanstack/react-query";
import { EditPage } from "@/components/client/system-router/edit/edit-page";
import { SystemRouterService } from "@/lib/service/system-router.service";
import { getQueryClient } from "@/hooks/use-query-client";
import { systemRouterDetailQuery } from "@/query/system-router.query";

interface Props {
    searchParams: Promise<{
        id?: string;
    }>;
}

export default async function Page({ searchParams }: Props) {
    const { id } = await searchParams;
    const queryClient = getQueryClient();

    if (id) {
        await queryClient
            .query({
                ...systemRouterDetailQuery.get(id),
                queryFn: () => SystemRouterService.getSystemRouter(id),
            })
            .catch(noop);
    }

    const parentRouters = await SystemRouterService.listParentOptions(id);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditPage
                id={id}
                parentRouters={parentRouters}
            />
        </HydrationBoundary>
    );
}
