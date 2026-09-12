import type { FieldInputTypes, FieldOutputTypes } from "@/prisma/contract";
import { CONTENT_CATEGORY_ITEM_KEYS } from "@/constant/content-category.constant";
type ContentCategoryFields = FieldInputTypes["public"]["ContentCategory"];
export type ContentCategoryRow = FieldOutputTypes["public"]["ContentCategory"];

export type InputContentCategory = Pick<
    ContentCategoryFields,
    | "name"
    | "slug"
    | "description"
    | "isActive"
    | "parentId"
    | "sortOrder"
>;

export type ContentCategoryItemVO = {
    id: string;
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    /** 展示用：父级名称，没有则 null */
    parentName: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
}

export type ContentCategoryTreeNode = ContentCategoryItemVO & {
    children?: ContentCategoryTreeNode[];
};