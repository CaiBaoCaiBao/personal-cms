import "server-only";
import { FieldInputTypes } from "@/prisma/contract";
import { db } from "@/prisma/db";
import { mapPrismaError } from "../errors/map-prisma-error";
import { PaginationQuery } from "@/types/globals.type";

type MediaFileInputFields = FieldInputTypes["public"]["MediaFile"];

export type MediaFileInput = Pick<MediaFileInputFields,
    | "originalName"
    | "url"
    | "mimeType"
    | "size"
    | "durationMs"
    | "storageKey"
>;

export type MediaFileQuery = Pick<MediaFileInputFields,
    | "originalName"
    | "mimeType"
    | "createdAt"
>

export class MediaFileDao {
    /** @description 插入媒体数据 */
    static async insert(data: MediaFileInput): Promise<void> {
        try {
            await db.orm.public.MediaFile.create(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA");
        }
    }

    /** @description 更新媒体数据 */
    static async update(id: string, data: Partial<MediaFileInput>): Promise<void> {
        try {
            await db.orm.public.MediaFile.where({
                id
            }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA");
        }
    }

    /** @description 查询媒体数据 */
    static async query(
        query: Partial<MediaFileQuery>,
        pagination: PaginationQuery
    ) {
        try {
            await db.orm.public.MediaFile
                .where(query)
                .offset((pagination.pageIndex) * pagination.pageSize)
                .limit(pagination.pageSize)
                .all();
        } catch (error) {
            throw mapPrismaError(error, "MEDIA");
        }
    }

    /** @description 根据存储键查询媒体数据 */
    static async queryByStorageKey(storageKey: string) {
        try {
            const row = await db.orm.public.MediaFile.where({ storageKey }).first();
            return row;
        } catch (error) {
            throw mapPrismaError(error, "MEDIA");
        }
    }

    /** @description 删除媒体数据 */
    static async delete(id: string): Promise<void> {
        try {
            await db.orm.public.MediaFile.where({ id }).delete();
        } catch (error) {
            throw mapPrismaError(error, "MEDIA");
        }
    }
}