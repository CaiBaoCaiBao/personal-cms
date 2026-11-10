import "server-only";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "@/lib/errors/map-prisma-error";
import { db } from "@/prisma/db";

type MediaFileFields = FieldInputTypes["public"]["MediaFile"];
export type MediaFileInput = Pick<
    MediaFileFields,
    "originalName" | "mime" | "size" | "width" | "height" | "durationMs"
    | "status" | "checksum" | "storageKey" | "url"
>;

export class MediaFileDao {
    static async insert(data: MediaFileInput): Promise<void> {
        try {
            await db.orm.public.MediaFile.create(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE")
        }
    }
    
    static async update(id: string, data: Partial<MediaFileInput>): Promise<void> {
        try {
            await db.orm.public.MediaFile.where({ id }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE")
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            await db.orm.public.MediaFile.where({ id }).delete();
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_FILE")
        }
    }
}