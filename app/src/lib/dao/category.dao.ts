import "server-only";
import { db } from "@/prisma/db";
import type { CategoryInputPO } from "@/type/category.type";
import { AppError } from "@/lib/utils";
import { mapPrismaError } from "@/lib/utils/server";
import { CATEGORY_ITEM_KEYS } from "@/type/category.type";

export class CategoryDao {
    /** @description 插入分类 */
    static async insert(po: CategoryInputPO) {
        try {
            const row = await db.orm.public.Category.create(po);
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 更新分类 */
    static async update(id: string, po: Partial<CategoryInputPO>) {
        try {
            const row = await db.orm.public.Category.where({
                deletedAt: null,
                id,
            }).update(po);
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 查找所有分类 */
    static async findAllForList() {
        try {
            let base = db.orm.public.Category.where({
                deletedAt: null,
            });
            const list = await base.orderBy([
                (c) => c.createdAt.desc(),
                (c) => c.name.asc()
            ]).select(...CATEGORY_ITEM_KEYS)
                .all();
            return list;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 删除分类 */
    static async delete(nodes: string[]) {
        try {
            await db.transaction(async (tx) => {
                for (const node of nodes) {
                    await tx.orm.public.Category.where({
                        deletedAt: null,
                        id: node,
                    }).update({
                        deletedAt: new Date().toISOString(),
                    })
                }
            })
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 根据父级ID查找子分类 */
    static async findChildren(parentId: string) {
        try {
            const children = await db.orm.public.Category.where({
                deletedAt: null,
                parentId,
            }).select(...CATEGORY_ITEM_KEYS).all();
            return children;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 根据ID查找分类 */
    static async findById(id: string) {
        try {
            const row = await db.orm.public.Category.where({
                deletedAt: null,
                id,
            }).first();
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /** @description 根据名称和父级ID查找分类 */
    static async findByNameAndParent(name: string, parentId: string) {
        try {
            const row = await db.orm.public.Category.where({
                deletedAt: null,
                name,
                parentId
            }).first();
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async findParent(id: string) {
        try {
            const row = await db.orm.public.Category.where({
                deletedAt: null,
                id,
            }).first();
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
}