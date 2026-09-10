import "server-only";
import { db } from "@/prisma/db";
import { AppError } from "../utils";
import { mapPrismaError } from "../utils/server";
import type {
    InputSystemRouter,
    SystemRouterNavRow,
} from "@/type/system-router.type";
import type { SystemRouterRow } from "@/type/system-router.type";

export class SystemRouterDao {
    /**
     * @description 创建系统路由
     */
    static async create(data: InputSystemRouter) {
        try {
            await db.orm.public.SystemRouter.create(data);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    /**
     * @description 更新系统路由
     */
    static async update(id: string, data: Partial<InputSystemRouter>) {
        try {
            await db.orm.public.SystemRouter.where({
                id,
                deletedAt: null,
            }).update(data);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    /**
     * @description 侧栏：查询全部启用中的路由（扁平行）
     */
    static async findAllForNav(): Promise<SystemRouterNavRow[]> {
        try {
            return await db.orm.public.SystemRouter.where({
                deletedAt: null,
                isActive: true,
            })
                .select(
                    "id",
                    "name",
                    "path",
                    "icon",
                    "parentId",
                    "routeType",
                    "sortOrder",
                    "defaultOpen",
                )
                .orderBy((r) => r.sortOrder.asc())
                .all();
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    /**
     * @description 管理列表：全部未删除路由（扁平行，树在 Service 组装）
     */
    static async findAllForList(): Promise<SystemRouterRow[]> {
        try {
            return await db.orm.public.SystemRouter.where({
                deletedAt: null,
            })
                .orderBy((r) => r.sortOrder.asc())
                .all();
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    /**
     * @description 父级候选：group / directory
     */
    static async findParentCandidates() {
        try {
            return await db.orm.public.SystemRouter.where({
                deletedAt: null,
            })
                .where((r) => r.routeType.in(["group", "directory"]))
                .select("id", "name", "path", "routeType", "parentId", "sortOrder")
                .orderBy((r) => r.sortOrder.asc())
                .all();
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    /**
     * @description 删除系统路由（软删）
     */
    static async remove(id: string) {
        try {
            await db.orm.public.SystemRouter.where({
                id,
                deletedAt: null,
            }).update({
                deletedAt: new Date().toISOString(),
            });
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    /**
     * @description 根据 ID 查询系统路由
     */
    static async findRouterById(id: string) {
        try {
            return await db.orm.public.SystemRouter.where({
                deletedAt: null,
            }).first({ id });
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    /**
     * @description 根据路径查询系统路由
     */
    static async findRouterByPath(path: string) {
        try {
            return await db.orm.public.SystemRouter.where({
                path,
                deletedAt: null,
            }).first();
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async findNamesByIds(ids: string[]): Promise<Map<string, string>> {
        if (ids.length === 0) {
            return new Map();
        }
        try {
            const rows = await db.orm.public.SystemRouter.where({
                deletedAt: null,
            })
                .where((r) => r.id.in(ids))
                .select("id", "name")
                .all();
            return new Map(rows.map((r) => [r.id, r.name]));
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    /**
     * @description 根据父级ID查询子级
     */
    static async findChildren(parentId: string) {
        try {
            const rows = await db.orm.public.SystemRouter.where({
                parentId,
                deletedAt: null,
            }).select("id").all();
            return rows.map((r) => r.id);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
    static async removeMany(ids: string[]) {
        if (ids.length === 0) return;
        try {
            await db.orm.public.SystemRouter.where((r) => r.id.in(ids))
                .where({ deletedAt: null })
                .update({ deletedAt: new Date().toISOString() });
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
}
