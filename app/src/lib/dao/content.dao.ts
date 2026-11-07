import "server-only";
import { db } from "@/prisma/db";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "../errors/map-prisma-error";

type ContentInputFields = FieldInputTypes["public"]["Content"];
export type ContentInput = Pick<ContentInputFields,
    | "title"
    | "type"
    | "status"
    | "archivedAt"
    | "publishedAt"
>

export class ContentDao {
    /** @description 创建内容 */
    static async insert(data: ContentInput) {
        try {
            await db.orm.public.Content.create(data);
        } catch (error) {
            throw mapPrismaError(error, "CONTENT")
        }
    }

    /** @description 更新内容 */
    static async update(id: string, data: Partial<ContentInput>) {
        try {
            await db.orm.public.Content.where({
                id,
                deletedAt: null
            }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "CONTENT")
        }
    }

    /** @description 删除内容 */
    static async delete(id: string) {
        try {
            await db.orm.public.Content.where({
                id,
                deletedAt: null
            }).update({
                deletedAt: new Date().toISOString()
            });
        } catch (error) {
            throw mapPrismaError(error, "CONTENT")
        }
    }
}