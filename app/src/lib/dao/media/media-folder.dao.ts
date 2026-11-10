import "server-only";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "@/lib/errors/map-prisma-error";
import { db } from "@/prisma/db";
import { MediaFolderList, mediaFolderListFields } from "@/types/media.type";

type MediaFolderFields = FieldInputTypes["public"]["MediaFolder"];

export type MediaFolderInput = Pick<MediaFolderFields,
    "name"
>;

export class MediaFolderDao {
    static async insert(data: MediaFolderInput): Promise<void> {
        try {
            await db.orm.public.MediaFolder.create(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FOLDER")
        }
    }

    static async update(id: string, data: Partial<MediaFolderInput>): Promise<void> {
        try {
            await db.orm.public.MediaFolder.where({ id }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FOLDER")
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            await db.orm.public.MediaFolder.where({ id }).delete();
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FOLDER")
        }
    }

    static async query(): Promise<MediaFolderList[]> {
        try {
            return await db.orm.public.MediaFolder
                .select(...mediaFolderListFields)
                .orderBy((order)=>order.name.asc())
                .all();
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FOLDER")
        }
    }
}