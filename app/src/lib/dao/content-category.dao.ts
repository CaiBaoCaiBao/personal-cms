import "server-only";

import { db } from "@/prisma/db";
import { mapPrismaError } from "@/lib/utils/server";
import { AppError } from "@/lib/utils";
import type { InputContentCategory } from "@/type/content-category.type";
import type { ListContentCategoryQueryDTO } from "@/lib/schema/content-category.schema";
import { CONTENT_CATEGORY_ITEM_KEYS } from "@/constant/content-category.constant";

export class ContentCategoryDao {

    static async create(data: InputContentCategory) {
        try {
            await db.orm.public.ContentCategory.create(data);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async update(id: string, data: Partial<InputContentCategory>) {
        try {
            await db.orm.public.ContentCategory.where({
                id,
                deletedAt: null,
            }).update(data);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 软删分类，并改写 slug 为 delete_${id} 以释放 @@unique([slug]) */
    static async remove(id: string) {
        try {
            await db.orm.public.ContentCategory.where({
                id,
                deletedAt: null,
            }).update({
                deletedAt: new Date().toISOString(),
                slug: `delete_${id}`,
            });
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async removeMany(ids: string[]) {
        if (ids.length === 0) return;
        try {
            await Promise.all(ids.map((id) => this.remove(id)));
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async query() {
        try {
            const rows = await db.orm.public.ContentCategory.where({
                deletedAt: null,
            })
                .orderBy((c) => c.sortOrder.asc())
                .all();
            return rows;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async findParentCandidates() {
        return await db.orm.public.ContentCategory.where({
            deletedAt: null,
            isActive: true,
        })
            .select("id", "name", "slug", "parentId", "sortOrder")
            .orderBy((c) => c.sortOrder.asc())
            .all();
    }
    static async findById(id: string) {
        try {
            const row = await db.orm.public.ContentCategory.where({
                id,
                deletedAt: null
            }).first();
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async findBySlug(slug: string) {
        try {
            const row = await db.orm.public.ContentCategory.where({
                slug,
                deletedAt: null
            }).first();
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
}