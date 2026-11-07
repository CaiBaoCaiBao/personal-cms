import "server-only";
import { db } from "@/prisma/db";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "../errors/map-prisma-error";

type ArticleInputFields = FieldInputTypes["public"]["Article"];
export type ArticleInput = Pick<ArticleInputFields,
    | "slug"
    | "contentId"
    | "coverImgId"
>;

export class ArticleDao {
    /** @description 创建文章 */
    static async insert(data: ArticleInput) {
        try {
            await db.orm.public.Article.create(data);
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }
    /** @description 更新文章 */
    static async update(id: string, data: Partial<ArticleInput>) {
        try {
            await db.orm.public.Article.where({ id }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }
    /** @description 删除文章 */
    static async delete(id: string) {
        try {
            await db.orm.public.Article.where({ id }).delete();
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }
}