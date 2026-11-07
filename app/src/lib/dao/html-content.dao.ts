import "server-only";
import { db } from "@/prisma/db";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "../errors/map-prisma-error";

type HtmlContentInputFields = FieldInputTypes["public"]["HtmlContent"];
export type HtmlContentInput = Pick<HtmlContentInputFields,
    | "contentId"
    | "body"
>;

export class HtmlContentDao {
    /** @description 创建HTML内容 */
    static async insert(data: HtmlContentInput) {
        try {
            await db.orm.public.HtmlContent.create(data);
        } catch (error) {
            throw mapPrismaError(error, "HTML_CONTENT");
        }
    }

    /** @description 更新HTML内容 */
    static async update(contentId: string, data: Partial<HtmlContentInput>) {
        try {
            await db.orm.public.HtmlContent.where({
                contentId,
            }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "HTML_CONTENT");
        }
    }
    
    /** @description 删除HTML内容 */
    static async delete(contentId: string) {
        try {
            await db.orm.public.HtmlContent.where({
                contentId,
            }).delete();
        } catch (error) {
            throw mapPrismaError(error, "HTML_CONTENT");
        }
    }

    static async findByContentId(contentId: string) {
        try {
            const row = await db.orm.public.HtmlContent.where({
                contentId
            }).first();
            return row;
        } catch (error) {
            throw mapPrismaError(error, "JSON_CONTENT");
        }
    }
}