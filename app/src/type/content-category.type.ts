import type { FieldInputTypes, FieldOutputTypes } from "@/prisma/contract";
import { ListContentCategoryQueryDTO } from "@/lib/schema/content-category.schema";
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

export type ContentCategoryParentOption = {
    id: string;
    name: string;
    slug: string;
};

export type PageOptions = {
    params: ListContentCategoryQueryDTO;
};

export type FormOptions = {
    id?: string;
    parentCategories: ContentCategoryParentOption[];
    initialData?: ContentCategoryItemVO;
};