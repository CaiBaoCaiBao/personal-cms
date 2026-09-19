import "server-only";

import { SaveCategoryDTO } from "@/lib/schema/category.schema";
import { CategoryDao } from "@/lib/dao";
import {
    ConflictError,
    normalizeParentId,
    NotFoundError,
    ValidationError,
} from "@/lib/utils";
import type { CategoryInputPO } from "@/type/category.type";
import { buildTree } from "@/lib/utils";

/**
 * 分类服务
 */
export class CategoryService {
    /** @description 创建分类 */
    static async create(dto: SaveCategoryDTO) {
        const parentId = normalizeParentId(dto.parentId);
        if (dto.parentId !== "") {
            const parent = await CategoryDao.findParent(parentId);
            if (!parent) {
                throw new NotFoundError("父级分类不存在");
            }
        }
        const existing = await CategoryDao.findByNameAndParent(dto.name, parentId);
        if (existing) {
            throw new ConflictError("该分类已存在");
        }
        await CategoryDao.insert(this.Dto2Po(dto));
    }
    /** @description 更新分类 */
    static async update(id: string, dto: SaveCategoryDTO) {
        const current = await CategoryDao.findById(id);
        if (!current) throw new NotFoundError("分类不存在");

        const parentId = normalizeParentId(dto.parentId);
        if (parentId === id) {
            throw new ValidationError("不能将分类设为自己的父级");
        }
        if (parentId) {
            const parent = await CategoryDao.findParent(parentId);
            if (!parent) throw new NotFoundError("父级分类不存在");
            // 沿 parent 向上，若遇到 id → 成环
            if (await this.wouldCreateCycle(id, parentId)) {
                throw new ConflictError("不能将分类移动到其子分类下");
            }
        }
        const existing = await CategoryDao.findByNameAndParent(dto.name, parentId);
        if (existing && existing.id !== id) {
            throw new ConflictError("该分类已存在");
        }
        await CategoryDao.update(id, this.Dto2Po(dto));
    }
    /** @description 获取分类树 */
    static async getTree() {
        const list = await CategoryDao.findAllForList();
        const tree = buildTree(list);
        return tree;
    }
    /** @description 删除分类（级联软删全部后代） */
    static async remove(id: string) {
        const nodes = await CategoryDao.findSelfAndDescendantIds(id);
        if (nodes.length === 0) throw new NotFoundError("分类不存在");
        await CategoryDao.delete(nodes);
    }
    /** @description 将DTO转换为PO */
    private static Dto2Po(dto: SaveCategoryDTO): CategoryInputPO {
        return {
            name: dto.name,
            description: dto.description ?? null,
            parentId: normalizeParentId(dto.parentId),
            isActive: dto.isActive,
        }
    }
    /** @description 判断是否创建循环 */
    private static async wouldCreateCycle(
        nodeId: string,
        newParentId: string,
        deep?: number
    ) {
        let parentId = newParentId;
        const visited = new Set<string>();
        const MAX_DEEPTH = deep ?? 64;

        for (let depth = 0; depth < MAX_DEEPTH; depth++) {
            if (parentId === "" || parentId === nodeId)
                return parentId === nodeId;

            if (visited.has(parentId)) return false;
            visited.add(parentId);

            const node = await CategoryDao.findById(parentId);
            if (!node) return false; // 节点断裂
            parentId = node.parentId;
        }
        return false;
    }
}