import {
    dehydrate,
    HydrationBoundary,
    noop,
} from "@tanstack/react-query";
import { ContentCategoryPage } from "@/components/client/content-category/content-category-page";
import { getQueryClient } from "@/hooks/use-query-client";
import { ContentCategoryService } from "@/lib/service/content-category.service";
import { contentCategoryListQuery } from "@/query/content-category.query";
import { listContentCategorySchema } from "@/lib/schema/content-category.schema";

type Props = {
    searchParams: Promise<{
        keyword?: string;
        isActive?: string;
    }>;
}

export default async function Page({ searchParams }: Props) {
    const sp = await searchParams;
    const params = listContentCategorySchema.parse(sp);
    const queryClient = getQueryClient();

    await queryClient
        .query({
            ...contentCategoryListQuery.list(params),
            queryFn: () => ContentCategoryService.listTree(params),
        })
        .catch(noop);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ContentCategoryPage params={params} />
        </HydrationBoundary>
    );
}