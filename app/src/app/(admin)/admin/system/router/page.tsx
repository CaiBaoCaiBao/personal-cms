import {
    dehydrate,
    HydrationBoundary,
    noop,
} from "@tanstack/react-query";
import { SystemRouterService } from "@/lib/service/system-router.service";
import { listSystemRouterQuerySchema } from "@/lib/schema/system-router.schema";
import { SystemRouterPage } from "@/components/client/system-router/system-router-page";
import { getQueryClient } from "@/hooks/use-query-client";
import { systemRouterListQuery } from "@/query/system-router.query";

type Props = {
    searchParams: Promise<{
        keyword?: string;
        routeType?: string;
        scope?: string;
        isActive?: string;
    }>;
};

export default async function Page({ searchParams }: Props) {
    const sp = await searchParams;
    const params = listSystemRouterQuerySchema.parse(sp);
    const queryClient = getQueryClient();

    await queryClient
        .query({
            ...systemRouterListQuery.list(params),
            queryFn: () => SystemRouterService.listTree(params),
        })
        .catch(noop);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SystemRouterPage params={params} />
        </HydrationBoundary>
    );
}
