import {
    dehydrate,
    HydrationBoundary,
    noop,
} from "@tanstack/react-query";
import { EditPage } from "@/components/client/content-category/edit/edit-page";
import { ContentCategoryService } from "@/lib/service/content-category.service";
import { getQueryClient } from "@/hooks/use-query-client";
import { contentCategoryDetailQuery } from "@/query/content-category.query";

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
                ...contentCategoryDetailQuery.get(id),
                queryFn: () => ContentCategoryService.getContentCategory(id),
            })
            .catch(noop);
    }

    const parentCategories = await ContentCategoryService.listParentOptions(id);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditPage
                id={id}
                parentCategories={parentCategories}
            />
        </HydrationBoundary>
    );
}
