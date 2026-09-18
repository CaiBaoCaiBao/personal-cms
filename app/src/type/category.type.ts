import type { FieldInputTypes, FieldOutputTypes } from "@/prisma/contract";

type CategoryFields = FieldInputTypes["public"]["Category"];
export const CATEGORY_ITEM_KEYS = [
    "id", "name", "description", "parentId", "isActive"
] as const;
export type CategoryRow = FieldOutputTypes["public"]["Category"];

export type CategoryInputPO = Pick<
    CategoryFields,
    | "name"
    | "description"
    | "parentId"
    | "isActive"
>

export type CategoryItemVO = Pick<
    CategoryRow,
    (typeof CATEGORY_ITEM_KEYS)[number]
>

export type CategoryTreeItemDTO = CategoryItemVO;
export type CategoryTreeNodeBO = CategoryTreeItemDTO & {
    children?: CategoryTreeNodeBO[];
}