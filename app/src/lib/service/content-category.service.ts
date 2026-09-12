import "server-only";
import { ListContentCategoryQueryDTO, SaveContentCategoryDto } from "@/lib/schema/content-category.schema";
import { ContentCategoryDao } from "@/lib/dao/content-category.dao";
import {
    ContentCategoryItemVO,
    ContentCategoryParentOption,
    ContentCategoryRow,
    ContentCategoryTreeNode,
    InputContentCategory,
} from "@/type/content-category.type";
import { AppError } from "@/lib/utils";
import { CONTENT_CATEGORY_ITEM_KEYS } from "@/constant/content-category.constant";

export class ContentCategoryService {
    /**
     * @description 创建分类
     */
    static async createContentCategory(dto: SaveContentCategoryDto) {
        try {
            let parent: Awaited<
                ReturnType<typeof ContentCategoryDao.findById>
            > = null;
            if (dto.parentId) {
                parent = await ContentCategoryDao.findById(dto.parentId);
                if (!parent) {
                    throw new AppError("NOT_FOUND", "父级分类不存在", 404);
                }
            }
            if (!this.validateSlug(dto.slug, parent?.slug ?? null)) {
                throw new AppError("VALIDATION_ERROR", "分类标识不合法", 400);
            }
            const existed = await ContentCategoryDao.findBySlug(dto.slug);
            if (existed) {
                throw new AppError("CONFLICT", "分类标识已存在", 409);
            }
            const data: InputContentCategory = this.toInput(dto);
            await ContentCategoryDao.create(data);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "创建分类失败", 500);
        }
    }
    /**
     * @description 更新分类
     */
    static async updateContentCategory(id: string, dto: SaveContentCategoryDto) {
        try {
            const existing = await ContentCategoryDao.findById(id);
            if (!existing) {
                throw new AppError("NOT_FOUND", "分类不存在", 404);
            }
            let parent: Awaited<
                ReturnType<typeof ContentCategoryDao.findById>
            > = null;
            if (dto.parentId) {
                if (dto.parentId === id) {
                    throw new AppError("VALIDATION_ERROR", "不能将自身设为父级", 400);
                }
                parent = await ContentCategoryDao.findById(dto.parentId);
                if (!parent) {
                    throw new AppError("NOT_FOUND", "父级分类不存在", 404);
                }
                const rows = await ContentCategoryDao.query();
                if (this.isSelfOrDescendant(dto.parentId, id, rows)) {
                    throw new AppError("VALIDATION_ERROR", "不能将自身或子孙设为父级", 400);
                }
            }
            if (!this.validateSlug(dto.slug, parent?.slug ?? null)) {
                throw new AppError("VALIDATION_ERROR", "分类标识不合法", 400);
            }
            const existed = await ContentCategoryDao.findBySlug(dto.slug);
            if (existed && existed.id !== id) {
                throw new AppError("CONFLICT", "分类标识已存在", 409);
            }
            const data: InputContentCategory = this.toInput(dto);
            await ContentCategoryDao.update(id, data);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "更新分类失败", 500);
        }
    }
    /**
     * @description 查询分类树
     */
    static async listTree(
        params: ListContentCategoryQueryDTO
    ): Promise<ContentCategoryTreeNode[]> {
        try {
            const rows = await ContentCategoryDao.query();
            return this.pruneTree(this.buildListTree(rows), params);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "查询分类失败", 500);
        }
    }
    /**
     * @description 父级下拉选项（可选排除自身及子孙，避免成环）
     */
    static async listParentOptions(
        excludeId?: string,
    ): Promise<ContentCategoryParentOption[]> {
        try {
            const rows = await ContentCategoryDao.findParentCandidates();
            const filtered = excludeId
                ? rows.filter((row) => !this.isSelfOrDescendant(row.id, excludeId, rows))
                : rows;
            return filtered.map((row) => ({
                id: row.id,
                name: row.name,
                slug: row.slug,
            }));
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "查询父级分类失败", 500);
        }
    }
    /**
     * @description 获取单个分类
     */
    static async getContentCategory(id: string): Promise<ContentCategoryItemVO> {
        try {
            const row = await ContentCategoryDao.findById(id);
            if (!row) {
                throw new AppError("NOT_FOUND", "分类不存在", 404);
            }
            let parentName: string | null = null;
            if (row.parentId) {
                const parent = await ContentCategoryDao.findById(row.parentId);
                parentName = parent?.name ?? null;
            }
            return this.toListVO(row, parentName);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "查询分类失败", 500);
        }
    }
    /**
     * @description 删除分类
     */
    static async deleteContentCategory(id: string) {
        try {
            const row = await ContentCategoryDao.findById(id);
            if (!row) throw new AppError("NOT_FOUND", "分类不存在", 404);
            const rows = await ContentCategoryDao.query(); // 已有扁平行
            const ids = this.collectSelfAndDescendants(id, rows);
            await ContentCategoryDao.removeMany(ids);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "删除分类失败", 500);
        }
    }
    /**
     * @description 构建分类树
     */
    private static buildListTree(rows: ContentCategoryRow[]): ContentCategoryTreeNode[] {
        const byId = new Map(rows.map((row) => [row.id, row]));
        const byParent = new Map<string | null, ContentCategoryRow[]>();
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

        const toNode = (row: ContentCategoryRow): ContentCategoryTreeNode => {
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
     * @description 转换为输入对象
     */
    private static toInput(dto: SaveContentCategoryDto): InputContentCategory {
        return {
            name: dto.name,
            slug: dto.slug,
            description: dto.description ?? null,
            isActive: dto.isActive,
            parentId: dto.parentId ?? null,
            sortOrder: dto.sortOrder,
        }
    }
    private static validateSlug(slug: string, parentSlug: string | null): boolean {
        if (!slug?.trim()) return false;
        if (/\s|\\|[#?]/.test(slug)) return false;
        if (slug.startsWith("/") || slug.endsWith("/")) return false;
        const segments = slug.split("/");
        if (segments.some((s) => !s || s === "." || s === "..")) return false;
        if (!segments.every((s) => s.length >= 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))) {
            return false;
        }
        if (parentSlug) {
            const prefix = `${parentSlug}/`;
            if (!slug.startsWith(prefix)) return false;
            const rest = slug.slice(prefix.length);
            // 只能比父级多恰好一段
            return rest.length >= 2 && !rest.includes("/");
        }
        return segments.length === 1;
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
     * @description 转换为列表VO
     */
    private static toListVO(
        row: ContentCategoryRow,
        parentName: string | null = null
    ): ContentCategoryItemVO {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description ?? "",
            parentId: row.parentId,
            parentName,
            sortOrder: row.sortOrder,
            isActive: row.isActive,
            createdAt: row.createdAt,
        };
    }
    /**
     * @description 筛选树：
     * - keyword 命中后解锁子树（子孙可不匹配 keyword）
     * - isActive 每个节点单独校验；不匹配时仅当有命中子孙才作为祖先保留
     */
    private static pruneTree(
        nodes: ContentCategoryTreeNode[],
        query: ListContentCategoryQueryDTO,
    ): ContentCategoryTreeNode[] {
        const hasFilter =
            Boolean(query.keyword) ||
            query.isActive !== undefined;
        if (!hasFilter) return nodes;

        const keyword = query.keyword?.toLowerCase();
        const matchesKeyword = (node: ContentCategoryTreeNode) => {
            if (!keyword) return true;
            const inName = node.name.toLowerCase().includes(keyword);
            const inSlug = node.slug.toLowerCase().includes(keyword);
            return inName || inSlug;
        };
        const matchesActive = (node: ContentCategoryTreeNode) =>
            query.isActive === undefined || node.isActive === query.isActive;

        const walk = (
            node: ContentCategoryTreeNode,
            keywordUnlocked: boolean,
        ): ContentCategoryTreeNode | null => {
            const keywordOk =
                !keyword || keywordUnlocked || matchesKeyword(node);
            const selfOk = keywordOk && matchesActive(node);
            const nextUnlocked =
                !keyword || keywordUnlocked || matchesKeyword(node);

            const children = (node.children ?? [])
                .map((child) => walk(child, nextUnlocked))
                .filter((child): child is ContentCategoryTreeNode => child !== null);

            if (!selfOk && children.length === 0) return null;
            return children.length > 0
                ? { ...node, children }
                : { ...node, children: undefined };
        };

        return nodes
            .map((node) => walk(node, false))
            .filter((node): node is ContentCategoryTreeNode => node !== null);
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