import "server-only";
import { FieldInputTypes } from "@/prisma/contract";
import { db } from "@/prisma/db";
import { mapPrismaError } from "../errors/map-prisma-error";
import { PaginationQuery } from "@/types/globals.type";
import { NotFoundError } from "../errors";
import {
    mediaFileListFields,
    type MediaFileList,
    mediaFileDetailFields,
    type MediaFileDetail
} from "@/types/media.type";
import { escapeLike } from "../utils/server";

type MediaFileInputFields = FieldInputTypes["public"]["MediaFile"];

export type MediaFileInput = Pick<MediaFileInputFields,
    | "originalName"
    | "url"
    | "hash"
    | "mimeType"
    | "size"
    | "durationMs"
    | "storageKey"
>;

export type MediaFileQuery = Pick<MediaFileInputFields,
    | "originalName"
    | "mimeType"
> & {
    createdFrom?: MediaFileInputFields["createdAt"];
    createdTo?: MediaFileInputFields["createdAt"];
};

export class MediaFileDao {
    /** @description 插入媒体数据 */
    static async insert(data: MediaFileInput): Promise<void> {
        try {
            await db.orm.public.MediaFile.create(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE");
        }
    }

    /** @description 更新媒体数据 */
    static async update(id: string, data: Partial<MediaFileInput>): Promise<void> {
        try {
            await db.orm.public.MediaFile.where({
                id
            }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE");
        }
    }

    /** @description 查询媒体数据 */
    static async query(
        query: Partial<MediaFileQuery>,
        pagination: PaginationQuery
    ): Promise<{ list: MediaFileList[], total: number }> {
        const filtered = db.orm.public.MediaFile.where((file, { fns }) => {
            const conditions = [];
            if (query.originalName) {
                conditions.push(file.originalName.like(`%${escapeLike(query.originalName)}%`));
            }
            if (query.mimeType) {
                conditions.push(file.mimeType.like(`${escapeLike(query.mimeType)}%`));
            }
            if (query.createdFrom) {
                conditions.push(file.createdAt.gte(query.createdFrom));
            }
            if (query.createdTo) {
                conditions.push(file.createdAt.lte(query.createdTo));
            }
            return conditions.length > 0 ? fns.and(...conditions) : file.id.isNotNull();
        });
        try {
            const rows = await filtered
                .orderBy([(file) => file.createdAt.desc()])
                .offset(pagination.pageIndex * pagination.pageSize)
                .limit(pagination.pageSize)
                .select(...mediaFileListFields)
                .all();
            const { total } = await filtered.aggregate((aggregate) => ({ total: aggregate.count() }));
            return { list: rows, total };
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE");
        }
    }

    /** @description 根据ID查询媒体数据 */
    static async queryById(id: string): Promise<MediaFileDetail | null> {
        try {
            const row = await db.orm.public.MediaFile
                .where({ id })
                .select(...mediaFileDetailFields)
                .first();
            return row;
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE");
        }
    }

    /** @description 根据存储键查询媒体数据 */
    static async queryByStorageKey(storageKey: string) {
        try {
            const row = await db.orm.public.MediaFile.where({ storageKey }).first();
            return row;
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE");
        }
    }

    /** @description 根据哈希查询媒体数据 */
    static async queryByHash(hash: string) {
        try {
            const row = await db.orm.public.MediaFile.where({ hash }).first();
            return row;
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE");
        }
    }

    /** @description 删除媒体数据 */
    static async delete(id: string): Promise<string> {
        try {
            const row = await db.orm.public.MediaFile.where({ id }).delete();
            if (!row) throw new NotFoundError("MEDIA_FILE", "Media file not found");
            return row.storageKey;
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE");
        }
    }
}