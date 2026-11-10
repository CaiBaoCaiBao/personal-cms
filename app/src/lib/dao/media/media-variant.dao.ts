import "server-only";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "@/lib/errors/map-prisma-error";
import { db } from "@/prisma/db";

type MediaVariantFields = FieldInputTypes["public"]["MediaVariant"];

export type MediaVariantInput = Pick<
    MediaVariantFields,
    "purpose" | "url" | "mime" | "size" | "width" | "height" | "storageKey" | "fileId"
>;

export class MediaVariantDao {
    static async insert(data: MediaVariantInput): Promise<void> {
        try {
            await db.orm.public.MediaVariant.create(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_VARIANT")
        }
    }

    static async update(id: string, data: Partial<MediaVariantInput>): Promise<void> {
        try {
            await db.orm.public.MediaVariant.where({ id }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_VARIANT")
        }
    }
}