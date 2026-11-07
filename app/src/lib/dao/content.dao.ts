import "server-only";
import { db } from "@/prisma/db";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "../errors/map-prisma-error";
import { PaginationQuery } from "@/types/globals.type";
import { escapeLike } from "../utils/escape";
import { contentListFields, ContentList } from "@/types/content.type";

type ContentInputFields = FieldInputTypes["public"]["Content"];
export type ContentInput = Pick<ContentInputFields,
    | "title"
    | "type"
    | "status"
    | "articleId"
    | "archivedAt"
    | "publishedAt"
>;

export type ContentQuery = Pick<ContentInputFields,
    | "title"
    | "type"
    | "status"
>;

export class ContentDao {
    /** @description 创建内容 */
    static async insert(data: ContentInput): Promise<string> {
        try {
            const row = await db.orm.public.Content.create(data);
            return row.id;
        } catch (error) {
            throw mapPrismaError(error, "CONTENT")
        }
    }

    /** @description 更新内容 */
    static async update(id: string, data: Partial<ContentInput>): Promise<void> {
        try {
            await db.orm.public.Content.where({
                id,
                deletedAt: null
            }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "CONTENT")
        }
    }

    /** @description 删除内容 */
    static async delete(id: string): Promise<void> {
        try {
            await db.orm.public.Content.where({
                id,
                deletedAt: null
            }).update({
                deletedAt: new Date().toISOString()
            });
        } catch (error) {
            throw mapPrismaError(error, "CONTENT")
        }
    }

    static async query(
        query: Partial<ContentQuery>,
        pagination: PaginationQuery
    ): Promise<{ list: ContentList[], total: number }> {
        const filtered = db.orm.public.Content.where((content, { fns }) => {
            const conditions = [
                content.deletedAt.isNull(),
                content.articleId.isNotNull(),
            ];
            if (query.title) {
                conditions.push(content.title.like(`%${escapeLike(query.title)}%`));
            }
            if (query.type) {
                conditions.push(content.type.eq(query.type));
            }
            if (query.status) {
                conditions.push(content.status.eq(query.status));
            }
            return fns.and(...conditions);
        })
        try {
            const rows = await filtered
                .orderBy([(content) => content.updatedAt.desc()])
                .offset(pagination.pageIndex * pagination.pageSize)
                .limit(pagination.pageSize)
                .select(...contentListFields)
                .all();
            const { total } = await filtered.aggregate((aggregate) => ({ total: aggregate.count() }));
            return {
                list: rows,
                total
            }
        } catch (error) {
            throw mapPrismaError(error, "CONTENT")
        }
    }

    /** @description 根据id查询内容 */
    static async findById(id: string) {
        try {
            const row = await db.orm.public.Content.where({ id, deletedAt: null }).first();
            return row;
        } catch (error) {
            throw mapPrismaError(error, "CONTENT")
        }
    }
}