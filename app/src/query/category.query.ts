import {
    queryOptions,
    mutationOptions
} from "@tanstack/react-query";
import { Http } from "@/lib/utils/https";
import { filterTree } from "@/lib/utils/build-tree";
import { getQueryClient } from "@/lib/utils/get-client-query";
import type { SaveCategoryDTO } from "@/lib/schema/category.schema";
import type { ApiSuccess } from "@/type/api-result.type";
import type { CategoryTreeNodeBO } from "@/type/category.type";

export const categoryQueryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryQueryKeys.all, 'list'] as const,
    list: () => [...categoryQueryKeys.lists()] as const,
}

function invalidateCategoryLists() {
    void getQueryClient().invalidateQueries({
        queryKey: categoryQueryKeys.lists(),
    });
}

export function filterCategoryTree(
    tree: CategoryTreeNodeBO[],
    keyword?: string,
): CategoryTreeNodeBO[] {
    const q = keyword?.trim().toLowerCase();
    if (!q) return tree;
    return filterTree(tree, (node) => {
        if (node.name.toLowerCase().includes(q)) return true;
        return node.description?.toLowerCase().includes(q) ?? false;
    });
}

export const queryCategoryList = () => queryOptions({
    queryKey: categoryQueryKeys.list(),
    queryFn: async ({ signal }) => {
        const res = await Http.get("/api/admin/v1/category", {
            signal
        }) as ApiSuccess<CategoryTreeNodeBO[]>;
        return res.data;
    }
});

export const deleteCategory = mutationOptions({
    mutationKey: [...categoryQueryKeys.all, "delete"],
    mutationFn: async (id: string) => {
        await Http.delete("/api/admin/v1/category", {
            params: { id }
        })
    },
    onSuccess: invalidateCategoryLists,
})

export const saveCategory = mutationOptions({
    mutationKey: [...categoryQueryKeys.all, "save"],
    mutationFn: async ({ dto, id }: { dto: SaveCategoryDTO; id?: string }) => {
        if (id) {
            await Http.put(`/api/admin/v1/category?id=${encodeURIComponent(id)}`, {
                params: dto
            });
            return;
        }
        await Http.post("/api/admin/v1/category", {
            params: dto
        });
    },
    onSuccess: invalidateCategoryLists,
})
