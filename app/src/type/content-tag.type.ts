import type { FieldInputTypes, FieldOutputTypes } from "@/prisma/contract";
import { CONTENT_TAG_ITEM_KEYS } from "@/constant/content-tag.constant";

type ContentTagFields = FieldInputTypes["public"]["ContentTag"];
export type ContentTagRow = FieldOutputTypes["public"]["ContentTag"];

export type InputContentTag = Pick<
    ContentTagFields,
    | "name"
    | "slug"
    | "description"
    | "color"
    | "isActive"
>;

export type ContentTagItemVO = Pick<
    ContentTagRow,
    (typeof CONTENT_TAG_ITEM_KEYS)[number]
>;

export type ContentTagListVO = ContentTagItemVO[];