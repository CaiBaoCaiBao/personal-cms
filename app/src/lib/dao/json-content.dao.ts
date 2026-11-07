import "server-only";
import { db } from "@/prisma/db";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "../errors/map-prisma-error";

type JsonContentInputFields = FieldInputTypes["public"]["JsonContent"];
export type JsonContentInput = Pick<JsonContentInputFields,
    | "contentId"
    | "body"
>;

export class JsonContentDao {

    /** @description 创建JSON内容 */
    static async insert(data: JsonContentInput) {
        try {
            await db.orm.public.JsonContent.create(data);
        } catch (error) {
            throw mapPrismaError(error, "JSON_CONTENT");
        }
    }

    /** @description 更新JSON内容 */
    static async update(contentId: string, data: Partial<JsonContentInput>) {
        try {
            await db.orm.public.JsonContent.where({
                contentId,
            }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "JSON_CONTENT");
        }
    }

    /** @description 删除JSON内容 */
    static async delete(contentId: string) {
        try {
            await db.orm.public.JsonContent.where({
                contentId,
            }).delete();
        } catch (error) {
            throw mapPrismaError(error, "JSON_CONTENT");
        }
    }

    static async findByContentId(contentId: string) {
        try {
            const row = await db.orm.public.JsonContent.where({
                contentId
            }).first();
            return row;
        } catch (error) {
            throw mapPrismaError(error, "JSON_CONTENT");
        }
    }
}