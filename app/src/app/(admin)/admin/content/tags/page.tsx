import { ContentTagPage } from "@/components/client/content-tag/content-tag-page";
import { getQueryClient } from "@/hooks/use-query-client";
import { ContentTagService } from "@/lib/service/content-tag.service";
import { contentTagListQuery } from "@/query/content-tag.query";
import { pageQuerySchema } from "@/lib/schema/content-tag.schema";
import {
    dehydrate,
    HydrationBoundary,
    noop,
} from "@tanstack/react-query";
type Props = {
    searchParams: Promise<{
        pageNumber?: string;
        pageSize?: string;
        isActive?: string;
        keyword?: string;
    }>
}

export default async function Page({ searchParams }: Props) {
    const sp = await searchParams;
    const params = pageQuerySchema.parse(sp);
    const queryClient = getQueryClient();

    await queryClient.query({
        ...contentTagListQuery.list(params),
        queryFn: () => ContentTagService.paginate(params)
    }).catch(noop);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ContentTagPage params={params} />
        </HydrationBoundary>
    )
}