import { FieldOutputTypes } from "@/prisma/contract";

type ContentOutput = FieldOutputTypes["public"]["Content"];
type ArticleOutput = FieldOutputTypes["public"]["Article"];
type JsonContentOutput = FieldOutputTypes["public"]["JsonContent"];
type HtmlContentOutput = FieldOutputTypes["public"]["HtmlContent"];

export const contentListFields = [
    "id",
    "title",
    "status",
    "type",
    "createdAt",
    "updatedAt",
    "publishedAt"
] as const satisfies readonly (keyof ContentOutput)[];

export const articleListFields = [
    "id",
    "slug",
    "coverImgId"
] as const satisfies readonly (keyof ArticleOutput)[];

export type ContentList = Pick<ContentOutput, typeof contentListFields[number]>;
export type ArticleList = Pick<ArticleOutput, typeof articleListFields[number]>;

export type ArticleListVO = ContentList & ArticleList;

export type ArticleDetailVO = {
    id: string;
    contentId: string;
    slug: string;
    coverImgId: string | null;
    title: string;
    type: ContentList["type"];
    status: ContentList["status"];
    createdAt: ContentList["createdAt"];
    updatedAt: ContentList["updatedAt"];
    publishedAt: ContentList["publishedAt"];
    jsonContent: string | null;
    htmlContent: string | null;
};