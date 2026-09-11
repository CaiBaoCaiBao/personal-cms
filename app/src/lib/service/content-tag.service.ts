import "server-only";
import { ContentTagDao } from "@/lib/dao";
import {
    CreateContentTagDto,
    PageQueryDto,
} from "@/lib/schema/content-tag.schema";
import { AppError } from "@/lib/utils";
import { Pagination } from "@/type/pagination.type";
import { ContentTagItemVO } from "@/type/content-tag.type";

export class ContentTagService {
    /**
     * @description 创建内容标签
     */
    static async createContentTag(dto: CreateContentTagDto) {
        try {
            const bySlug = await ContentTagDao.findBySlug(dto.slug);
            if (bySlug) {
                throw new AppError("CONFLICT", "Content tag already exists", 409, {
                    fields: ["slug"],
                    values: [dto.slug],
                    message: "Content tag already exists",
                });
            }
            await ContentTagDao.create({
                ...dto,
            });
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError(
                "INTERNAL_ERROR",
                "Failed to create content tag",
                500, {
                fields: ["slug"],
                values: [dto.slug],
                message: "Failed to create content tag",
            });
        }
    }
    /**
     * @description 更新内容标签
     */
    static async updateContentTag(id: string, dto: CreateContentTagDto) {
        try {
            const existing = await ContentTagDao.findById(id);
            if (!existing) {
                throw new AppError("NOT_FOUND", "Content tag not found", 404, {
                    fields: ["id"],
                    values: [id],
                    message: "Content tag not found",
                });
            }
            const bySlug = await ContentTagDao.findBySlug(dto.slug);
            if (bySlug && bySlug.id !== id) {
                throw new AppError("CONFLICT", "Content tag already exists", 409, {
                    fields: ["slug"],
                    values: [dto.slug],
                    message: "Content tag already exists",
                });
            }
            await ContentTagDao.update(id, {
                ...dto,
            });
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "Failed to update content tag", 500, {
                fields: ["id"],
                values: [id],
                message: "Failed to update content tag",
            });
        }
    }
    /**
     * @description 删除多个内容标签
     */
    static async removeMany(ids: string[]) {
        try {
            await Promise.all(ids.map(id => ContentTagDao.remove(id)));
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "Failed to remove content tags", 500, {
                fields: ["ids"],
                values: [ids.join(",")],
                message: "Failed to remove content tags",
            });
        }
    }
    /**
     * @description 分页查询内容标签
     */
    static async paginate(
        query: PageQueryDto
    ): Promise<Pagination<ContentTagItemVO>> {
        const {
            list,
            total
        } = await ContentTagDao.query(query);
        return {
            list,
            total,
            pageNumber: query.pageNumber,
            pageSize: query.pageSize,
        }
    }
    /**
     * @description 查询内容标签详情
     */
    static async getDetail(id: string) {
        return await ContentTagDao.findById(id);
    }
}