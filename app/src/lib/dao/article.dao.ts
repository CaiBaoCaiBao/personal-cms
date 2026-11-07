import "server-only";
import { db } from "@/prisma/db";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "../errors/map-prisma-error";
import { escapeLike } from "../utils/server";
import { articleListFields, type ArticleList } from "@/types/content.type";

type ArticleInputFields = FieldInputTypes["public"]["Article"];
export type ArticleInput = Pick<ArticleInputFields,
    | "slug"
    | "contentId"
    | "coverImgId"
>;

type ArticleListRow = ArticleList & Pick<ArticleInputFields, "contentId">;

export class ArticleDao {
    /** @description 创建文章 */
    static async insert(data: ArticleInput): Promise<string> {
        try {
            const row = await db.orm.public.Article.create(data);
            return row.id;
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }
    /** @description 更新文章 */
    static async update(id: string, data: Partial<Exclude<ArticleInputFields, "contentId">>): Promise<void> {
        try {
            await db.orm.public.Article.where({ id }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }
    /** @description 删除文章 */
    static async delete(id: string): Promise<void> {
        try {
            await db.orm.public.Article.where({ id }).delete();
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }

    /** @description 获取指定前缀的slug列表 */
    static async listSlugs(base: string): Promise<string[]> {
        try {
            const prefix = escapeLike(base);
            const rows = await db.orm.public.Article.where((article, { fns }) =>
                fns.or(
                    article.slug.eq(base),
                    article.slug.like(`${prefix}-%`),
                ),
            ).select("slug").all();
            return rows.map((row) => row.slug);
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }

    static async findById(id: string) {
        try {
            const row = await db.orm.public.Article.where({ id }).first();
            return row;
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }

    /** @description 按内容 id 批量查询文章 */
    static async listByContentIds(contentIds: string[]): Promise<ArticleListRow[]> {
        if (contentIds.length === 0) return [];
        try {
            const rows = await db.orm.public.Article.where((article, { fns }) =>
                contentIds.length === 1
                    ? article.contentId.eq(contentIds[0])
                    : fns.or(...contentIds.map((contentId) => article.contentId.eq(contentId))),
            ).select(...articleListFields, "contentId").all();
            return rows;
        } catch (error) {
            throw mapPrismaError(error, "ARTICLE");
        }
    }
}