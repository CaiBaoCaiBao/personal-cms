import type { FieldInputTypes, FieldOutputTypes } from "@/prisma/contract";
import { CONTENT_TAG_ITEM_KEYS } from "@/constant/content-tag.constant";
import { PageQueryDto } from "@/lib/schema/content-tag.schema";

type ContentTagFields = FieldInputTypes["public"]["ContentTag"];
export type ContentTagRow = FieldOutputTypes["public"]["ContentTag"];

export type InputContentTag = Pick<
    ContentTagFields,
    | "name"
    | "slug"
    | "description"
    | "isActive"
>;

export type ContentTagItemVO = Pick<
    ContentTagRow,
    (typeof CONTENT_TAG_ITEM_KEYS)[number]
>;

export type ContentTagListVO = ContentTagItemVO[];

export type PageOptions = {
    params: PageQueryDto;
}

export type FormOptions = {
    id?: string;
    initialData?: ContentTagItemVO | null;
    open?: boolean;
    onSuccess?: () => void;
};