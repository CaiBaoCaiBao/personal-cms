import "server-only";

import { db } from "@/prisma/db";
import { mapPrismaError } from "@/lib/utils/server";
import { AppError } from "@/lib/utils";
import type {
    InputContentTag,
    ContentTagItemVO
} from "@/type/content-tag.type";
import type { Pagination } from "@/type/pagination.type";
import { CONTENT_TAG_ITEM_KEYS } from "@/constant/content-tag.constant";

export class ContentTagDao {
    /** @description 创建标签 */
    static async create(data: InputContentTag) {
        try {
            await db.orm.public.ContentTag.create(data);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 更新标签 */
    static async update(id: string, data: Partial<InputContentTag>) {
        try {
            await db.orm.public.ContentTag.where({
                id,
                deletedAt: null
            }).update(data);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 查询标签列表 */
    static async query(
        pageNumber: number,
        pageSize: number
    ) {
        try {
            const list = await db.orm.public.ContentTag.where({
                deletedAt: null
            })
                .orderBy((t) => t.createdAt.desc())
                .select(...CONTENT_TAG_ITEM_KEYS)
                .limit(pageSize)
                .offset((pageNumber - 1) * pageSize)
                .all();

            const { total } = await db.orm.public.ContentTag.where({
                deletedAt: null
            }).aggregate((a) => ({ total: a.count() }));
            return {
                list,
                total,
            }
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 查询标签详情 */
    static async findById(id: string): Promise<ContentTagItemVO | null> {
        try {
            const row = await db.orm.public.ContentTag.where({
                id,
                deletedAt: null
            }).select(...CONTENT_TAG_ITEM_KEYS).first();
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 删除标签 */
    static async remove(id: string) {
        try {
            await db.orm.public.ContentTag.where({
                id,
                deletedAt: null
            }).update({
                deletedAt: new Date().toISOString()
            });
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async findBySlug(slug: string): Promise<ContentTagItemVO | null> {
        try {
            const row = await db.orm.public.ContentTag.where({
                slug,
                deletedAt: null
            }).select(...CONTENT_TAG_ITEM_KEYS).first();
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
}