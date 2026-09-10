import "server-only";
import { SystemRouterDao } from "../dao";
import type {
    CreateSystemRouterDTO,
    ListSystemRouterQueryDTO,
} from "@/lib/schema/system-router.schema";
import type {
    AdminNavGroup,
    AdminNavItem,
    InputSystemRouter,
    RouteType,
    SystemRouterNavRow,
    SystemRouterParentOption,
    SystemRouterListVO,
    SystemRouterTreeNode,
    SystemRouterListQuery,
} from "@/type/system-router.type";
import { AppError } from "@/lib/utils/errors/app-error";
import { ROUTE_TYPE_LABEL_MAP } from "@/constant/system-router.constant";
import type { SystemRouterRow } from "@/type/system-router.type";
import { TelemetryPlugin } from "next/dist/build/webpack/plugins/telemetry-plugin/telemetry-plugin";

export class SystemRouterService {
    /**
     * @description 创建系统路由
     */
    static async createSystemRouter(data: CreateSystemRouterDTO) {
        try {
            if (data.routeType === "group") {
                if (data.parentId) {
                    throw new AppError("VALIDATION_ERROR", "分组不能有父级", 400);
                }
                await SystemRouterDao.create(this.toInput(data));
                return;
            }

            let parent: Awaited<
                ReturnType<typeof SystemRouterDao.findRouterById>
            > = null;
            if (data.parentId) {
                parent = await SystemRouterDao.findRouterById(data.parentId);
                if (!parent) {
                    throw new AppError("NOT_FOUND", "父级路由不存在", 404);
                }
                this.assertParentAllowed(data.routeType, parent.routeType);
            }

            if (!this.validatePath(data.routeType, data.path, parent?.path ?? null)) {
                throw new AppError("VALIDATION_ERROR", "路由路径不合法", 400);
            }

            const existed = await SystemRouterDao.findRouterByPath(data.path);
            if (existed) {
                throw new AppError("CONFLICT", "路由路径已存在", 409);
            }

            await SystemRouterDao.create(this.toInput(data));
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "创建系统路由失败", 500);
        }
    }
    /**
     * @description 更新系统路由
     */
    static async updateSystemRouter(id: string, data: CreateSystemRouterDTO) {
        try {
            const existing = await SystemRouterDao.findRouterById(id);
            if (!existing) {
                throw new AppError("NOT_FOUND", "系统路由不存在", 404);
            }

            if (data.routeType === "group") {
                if (data.parentId) {
                    throw new AppError("VALIDATION_ERROR", "分组不能有父级", 400);
                }
                await SystemRouterDao.update(id, this.toInput(data));
                return;
            }

            let parent: Awaited<
                ReturnType<typeof SystemRouterDao.findRouterById>
            > = null;
            if (data.parentId) {
                if (data.parentId === id) {
                    throw new AppError("VALIDATION_ERROR", "不能将自身设为父级", 400);
                }
                parent = await SystemRouterDao.findRouterById(data.parentId);
                if (!parent) {
                    throw new AppError("NOT_FOUND", "父级路由不存在", 404);
                }
                this.assertParentAllowed(data.routeType, parent.routeType);
                const rows = await SystemRouterDao.findAllForList();
                if (this.isSelfOrDescendant(data.parentId, id, rows)) {
                    throw new AppError("VALIDATION_ERROR", "不能将自身或子孙设为父级", 400);
                }
            }

            if (!this.validatePath(data.routeType, data.path, parent?.path ?? null)) {
                throw new AppError("VALIDATION_ERROR", "路由路径不合法", 400);
            }

            const existed = await SystemRouterDao.findRouterByPath(data.path);
            if (existed && existed.id !== id) {
                throw new AppError("CONFLICT", "路由路径已存在", 409);
            }

            await SystemRouterDao.update(id, this.toInput(data));
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "更新系统路由失败", 500);
        }
    }
    /**
     * @description 侧栏菜单树
     */
    static async getSidebarNav(): Promise<AdminNavGroup[]> {
        try {
            const rows = await SystemRouterDao.findAllForNav();
            return this.buildSidebarNav(rows);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "查询侧栏路由失败", 500);
        }
    }
    /**
     * @description 管理列表：一次返回全树（筛选时保留命中节点的祖先）
     */
    static async listTree(
        query: ListSystemRouterQueryDTO,
    ): Promise<SystemRouterTreeNode[]> {
        try {
            const rows = await SystemRouterDao.findAllForList();
            return this.pruneTree(this.buildListTree(rows), query);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "查询系统路由失败", 500);
        }
    }
    /**
     * @description 父级下拉选项（可选排除自身及子孙，避免成环）
     */
    static async listParentOptions(
        excludeId?: string,
    ): Promise<SystemRouterParentOption[]> {
        try {
            const rows = await SystemRouterDao.findParentCandidates();
            const filtered = excludeId
                ? rows.filter((row) => !this.isSelfOrDescendant(row.id, excludeId, rows))
                : rows;

            return filtered.map((row) => ({
                id: row.id,
                name: row.name,
                path: row.path,
                routeType: row.routeType as Extract<RouteType, "group" | "directory">,
            }));
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "查询父级路由失败", 500);
        }
    }
    /**
     * @description 获取系统路由
     */
    static async getSystemRouter(id: string) {
        try {
            const row = await SystemRouterDao.findRouterById(id);
            if (!row) {
                throw new AppError("NOT_FOUND", "系统路由不存在", 404);
            }
            return this.toListVO(row);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "查询系统路由失败", 500);
        }
    }
    /**
     * @description 删除系统路由
     */
    static async deleteSystemRouter(id: string) {
        try {
            const row = await SystemRouterDao.findRouterById(id);
            if (!row) throw new AppError("NOT_FOUND", "系统路由不存在", 404);
            const rows = await SystemRouterDao.findAllForList(); // 已有扁平行
            const ids = this.collectSelfAndDescendants(id, rows);
            await SystemRouterDao.removeMany(ids);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "删除系统路由失败", 500);
        }
    }
    /**
     * @description 构建侧栏菜单树
     */
    private static buildSidebarNav(rows: SystemRouterNavRow[]): AdminNavGroup[] {
        const byParent = new Map<string | null, SystemRouterNavRow[]>();
        for (const row of rows) {
            const key = row.parentId;
            const bucket = byParent.get(key) ?? [];
            bucket.push(row);
            byParent.set(key, bucket);
        }

        for (const bucket of byParent.values()) {
            bucket.sort(
                (a, b) =>
                    a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "zh-CN"),
            );
        }

        const toItem = (row: SystemRouterNavRow): AdminNavItem => {
            const children = (byParent.get(row.id) ?? []).map(toItem);
            return {
                id: row.id,
                title: row.name,
                path: row.path,
                routeType: row.routeType,
                icon: row.icon,
                defaultOpen: row.defaultOpen,
                ...(children.length > 0 ? { children } : {}),
            };
        };

        const roots = byParent.get(null) ?? [];
        const result: AdminNavGroup[] = [];
        let untitledItems: AdminNavItem[] = [];

        const flushUntitled = () => {
            if (untitledItems.length === 0) return;
            result.push({ items: untitledItems });
            untitledItems = [];
        };

        for (const root of roots) {
            if (root.routeType === "group") {
                flushUntitled();
                result.push({
                    title: root.name,
                    items: (byParent.get(root.id) ?? []).map(toItem),
                });
            } else {
                untitledItems.push(toItem(root));
            }
        }
        flushUntitled();
        return result;
    }
    /**
     * @description 管理列表树：根节点数组，同级按 sortOrder / 名称
     */
    private static buildListTree(rows: SystemRouterRow[]): SystemRouterTreeNode[] {
        const byId = new Map(rows.map((row) => [row.id, row]));
        const byParent = new Map<string | null, SystemRouterRow[]>();
        for (const row of rows) {
            const parentExists = Boolean(row.parentId && byId.has(row.parentId));
            const key = parentExists ? row.parentId : null;
            const bucket = byParent.get(key) ?? [];
            bucket.push(row);
            byParent.set(key, bucket);
        }

        for (const bucket of byParent.values()) {
            bucket.sort(
                (a, b) =>
                    a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "zh-CN"),
            );
        }

        const toNode = (row: SystemRouterRow): SystemRouterTreeNode => {
            const children = (byParent.get(row.id) ?? []).map(toNode);
            const vo = this.toListVO(
                row,
                row.parentId ? (byId.get(row.parentId)?.name ?? null) : null,
            );
            return children.length > 0 ? { ...vo, children } : vo;
        };

        return (byParent.get(null) ?? []).map(toNode);
    }
    /**
     * @description 筛选树：命中节点保留整棵子树，未命中则仅保留有命中子孙的祖先
     */
    private static pruneTree(
        nodes: SystemRouterTreeNode[],
        query: SystemRouterListQuery,
    ): SystemRouterTreeNode[] {
        const hasFilter =
            Boolean(query.keyword) ||
            query.routeType !== undefined ||
            query.isActive !== undefined;
        if (!hasFilter) return nodes;

        const keyword = query.keyword?.toLowerCase();
        const matches = (node: SystemRouterTreeNode) => {
            if (keyword) {
                const inName = node.name.toLowerCase().includes(keyword);
                const inPath = node.path?.toLowerCase().includes(keyword) ?? false;
                if (!inName && !inPath) return false;
            }
            if (query.routeType !== undefined && node.routeType !== query.routeType) {
                return false;
            }
            if (query.isActive !== undefined && node.isActive !== query.isActive) {
                return false;
            }
            return true;
        };

        const walk = (
            node: SystemRouterTreeNode,
            keepAll: boolean,
        ): SystemRouterTreeNode | null => {
            const keepBranch = keepAll || matches(node);
            const children = (node.children ?? [])
                .map((child) => walk(child, keepBranch))
                .filter((child): child is SystemRouterTreeNode => child !== null);

            if (!keepBranch && children.length === 0) return null;
            return children.length > 0
                ? { ...node, children }
                : { ...node, children: undefined };
        };

        return nodes
            .map((node) => walk(node, false))
            .filter((node): node is SystemRouterTreeNode => node !== null);
    }
    /**
     * @description 判断是否为自身或子孙
     */
    private static isSelfOrDescendant(
        id: string,
        excludeId: string,
        rows: { id: string; parentId: string | null }[],
    ): boolean {
        const byId = new Map(rows.map((row) => [row.id, row]));
        let current: string | null = id;
        while (current) {
            if (current === excludeId) return true;
            current = byId.get(current)?.parentId ?? null;
        }
        return false;
    }
    /**
     * @description 断言父级是否允许
     */
    private static assertParentAllowed(child: RouteType, parent: RouteType) {
        if (parent === "link" || parent === "page") {
            throw new AppError("VALIDATION_ERROR", "页面/外链不能作为父级", 400);
        }
        if (child === "group") {
            throw new AppError("VALIDATION_ERROR", "分组必须是根节点", 400);
        }
    }
    /**
     * @description 验证路径是否合法
     */
    private static validatePath(
        routeType: RouteType,
        path: string,
        parentPath?: string | null,
    ) {
        if (routeType === "group") return true;
        if (!path?.trim()) return false;

        if (routeType === "link") {
            try {
                const url = new URL(path);
                return (
                    (url.protocol === "http:" || url.protocol === "https:") &&
                    Boolean(url.hostname)
                );
            } catch {
                return false;
            }
        }

        if (/\s|\\|[#?]/.test(path)) return false;
        if (!path.startsWith("/") || path === "/") return false;
        if (path.endsWith("/")) return false;

        const segments = path.slice(1).split("/");
        if (segments.some((s) => !s || s === "." || s === "..")) return false;
        if (!segments.every((s) => /^[a-zA-Z0-9_-]+$/.test(s))) return false;

        if (parentPath) {
            if (!parentPath.startsWith("/")) return false;
            const prefix = parentPath.endsWith("/")
                ? parentPath
                : `${parentPath}/`;
            return path.startsWith(prefix);
        }
        return true;
    }
    /**
     * @description 转换为输入对象
     */
    private static toInput(data: CreateSystemRouterDTO): InputSystemRouter {
        return {
            name: data.name,
            path: data.routeType === "group" ? null : data.path,
            icon: data.icon ?? null,
            parentId: data.parentId ?? null,
            routeType: data.routeType,
            sortOrder: data.sortOrder,
            defaultOpen: data.defaultOpen,
            isActive: data.isActive,
        };
    }
    /**
     * @description 转换为列表VO
     */
    private static toListVO(
        row: SystemRouterRow,
        parentName: string | null = null
    ): SystemRouterListVO {
        return {
            id: row.id,
            name: row.name,
            path: row.path,
            icon: row.icon,
            parentId: row.parentId,
            parentName,
            routeType: row.routeType,
            routeTypeLabel: ROUTE_TYPE_LABEL_MAP[row.routeType],
            sortOrder: row.sortOrder,
            defaultOpen: row.defaultOpen,
            isActive: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
    /**
     * @description 收集自身及所有后代(DFS)
     */
    private static collectSelfAndDescendants(
        rootId: string,
        rows: { id: string; parentId: string | null }[],
    ): string[] {
        const childrenOf = new Map<string, string[]>();
        for (const r of rows) {
            if (!r.parentId) continue;
            const bucket = childrenOf.get(r.parentId) ?? [];
            bucket.push(r.id);
            childrenOf.set(r.parentId, bucket);
        }
        const result: string[] = [];
        const stack = [rootId];
        while (stack.length) {
            const cur = stack.pop()!;
            result.push(cur);
            for (const child of childrenOf.get(cur) ?? []) stack.push(child);
        }
        return result;
    }
}
