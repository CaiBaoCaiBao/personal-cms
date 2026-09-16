import "server-only";
import { SaveSystemRouterDTO } from "@/lib/schema/system-router.schema";
import { SystemRouterDao } from "@/lib/dao";
import { NotFoundError, ConflictError } from "@/lib/utils";
import { SaveSystemRouterPO } from "@/type/system-router.type";
export class SystemRouterService {
    /**
     * @description 创建系统路由
     */
    static async create(dto: SaveSystemRouterDTO) {
        if (dto.routeType === "group") {
            await this.assertGroupParent(dto.parentId);
            await SystemRouterDao.insert(this.toInput(dto));
            return;
        }
        if (dto.routeType === "set") {

        }
        if (dto.path) {
            const existing = await SystemRouterDao.findByPath(dto.path);
            if (existing) {
                throw new ConflictError("路径已存在");
            }
        }

    }

    static async update(dto: SaveSystemRouterDTO) {

    }
    /**
     * @description 断言分组父级
     */
    private static async assertGroupParent(
        parentId: string | undefined,
        selfId?: string,
    ) {

    }
    /** @description 转换为数据库输入对象 */
    private static toInput(dto: SaveSystemRouterDTO): SaveSystemRouterPO {
        return {
            name: dto.name,
            path: dto.path ?? null,
            icon: dto.icon ?? null,
            parentId: dto.parentId ?? null,
            routeType: dto.routeType,
            sortOrder: dto.sortOrder,
            isActive: dto.isActive,
            isFold: dto.isFold,
        };
    }
}