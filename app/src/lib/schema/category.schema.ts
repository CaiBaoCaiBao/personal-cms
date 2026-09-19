import { z } from "zod";

export const saveCategorySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    parentId: z.string().optional(),
    isActive: z.boolean().default(true),
})

export const queryCategoryListSchema = z.object({
    keyword:z.string().optional(),
})

export type SaveCategoryDTO = z.output<typeof saveCategorySchema>;
export type SaveCategoryForm = z.input<typeof saveCategorySchema>;
export type QueryCategoryListDTO = z.output<typeof queryCategoryListSchema>;

export const defaultSaveCategoryForm: SaveCategoryForm = {
    name: "",
    description: "",
    parentId: "",
    isActive: true,
}