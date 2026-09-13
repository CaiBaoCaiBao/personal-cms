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
     * @description 侧栏：启用中的后台节点 + 全部启用中的场景根（set 不受 scope 约束）
     */
    static async findAllForNav(): Promise<SystemRouterNavRow[]> {
        try {
            const rows = await db.orm.public.SystemRouter.where({
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
                    "scope",
                )
                .orderBy((r) => r.sortOrder.asc())
                .all();
            return rows
                .filter(
                    (row) =>
                        row.routeType !== "button" &&
                        (row.routeType === "set" || row.scope === "admin"),
                )
                .map(({ scope: _scope, ...row }) => row);
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
     * @description 父级候选：set / group / directory / page
     */
    static async findParentCandidates() {
        try {
            return await db.orm.public.SystemRouter.where({
                deletedAt: null,
            })
                .where((r) => r.routeType.in(["set", "group", "directory", "page"]))
                .select("id", "name", "path", "routeType", "parentId", "sortOrder")
                .orderBy((r) => r.sortOrder.asc())
                .all();
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    /**
     * @description 软删系统路由；有 path 时改写为 delete_${id} 以释放 @@unique([path])
     */
    static async remove(id: string) {
        try {
            const row = await db.orm.public.SystemRouter.where({
                id,
                deletedAt: null,
            })
                .select("id", "path")
                .first();
            if (!row) return;

            const deletedAt = new Date().toISOString();
            await db.orm.public.SystemRouter.where({
                id,
                deletedAt: null,
            }).update(
                row.path
                    ? { deletedAt, path: `delete_${id}` }
                    : { deletedAt },
            );
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
            await Promise.all(ids.map((id) => this.remove(id)));
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
}
