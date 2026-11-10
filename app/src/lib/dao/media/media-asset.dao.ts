import "server-only";
import { FieldInputTypes } from "@/prisma/contract";
import { mapPrismaError } from "@/lib/errors/map-prisma-error";
import { db } from "@/prisma/db";
import { PaginationQuery } from "@/types/globals.type";
import {
    MediaAssetDetail,
    mediaAssetDetailFields,
    mediaAssetDetailFileFields,
    mediaAssetDetailFilesFields,
    mediaAssetDetailFileVariantFields,
    MediaAssetList,
    mediaAssetListFields,
    mediaAssetListFileFields,
    mediaThumbFields,
} from "@/types/media.type";

type MediaAssetFields = FieldInputTypes["public"]["MediaAsset"];

export type MediaAssetInput = Pick<
    MediaAssetFields,
    "title" | "description" | "kind" | "folderId" | "currentFileId" | "status"
>;

export type MediaAssetQuery = Partial<
    Pick<MediaAssetInput, "title" | "folderId" | "kind" | "status">
>;

function containsPattern(value: string) {
    const escaped = value.replace(/[\\%_]/g, (char) => `\\${char}`);
    return `%${escaped}%`;
}

export class MediaAssetDao {
    static async insert(data: MediaAssetInput): Promise<void> {
        try {
            await db.orm.public.MediaAsset.create(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_ASSET")
        }
    }

    static async update(id: string, data: Partial<MediaAssetInput>): Promise<void> {
        try {
            await db.orm.public.MediaAsset.where({ id }).update(data);
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_ASSET")
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            await db.orm.public.MediaAsset.where({ id }).delete();
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_ASSET")
        }
    }

    static async query(
        page: PaginationQuery, query: MediaAssetQuery
    ): Promise<{
        rows: MediaAssetList[],
        total: number
    }> {
        const filtered = db.orm.public.MediaAsset.where((asset, { fns }) => {
            const conditions = [];
            if (query.title) {
                conditions.push(asset.title.like(containsPattern(query.title)))
            }
            if (query.folderId) {
                conditions.push(asset.folderId.eq(query.folderId))
            }
            if (query.kind) {
                conditions.push(asset.kind.eq(query.kind))
            }
            if (query.status) {
                conditions.push(asset.status.eq(query.status))
            }
            return conditions.length > 0 ? fns.and(...conditions) : asset.id.isNotNull();
        })
        try {
            const rows = await filtered
                .select(...mediaAssetListFields)
                .include("currentFile", (file) => file
                    .where((row) => row.status.eq("READY"))
                    .select(...mediaAssetListFileFields)
                    .include("variants", (variants) =>
                        variants
                            .where((row) => row.purpose.eq("thumb"))
                            .select(...mediaThumbFields),
                    ),
                )
                .limit(page.pageSize)
                .offset(page.pageSize * page.pageIndex)
                .orderBy([(asset) => asset.title.asc(), (asset) => asset.createdAt.desc()])
                .all();
            const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
            return {
                rows,
                total
            }
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_ASSET")
        }
    }

    static async findById(id: string): Promise<MediaAssetDetail | null> {
        try {
            return await db.orm.public.MediaAsset
                .where({ id })
                .select(...mediaAssetDetailFields)
                .include("currentFile", (file) =>
                    file
                        .select(...mediaAssetDetailFileFields)
                        .include("variants", (variants) =>
                            variants.select(...mediaAssetDetailFileVariantFields),
                        ),
                )
                .include("files", (files) =>
                    files
                        .select(...mediaAssetDetailFilesFields)
                        .orderBy((file) => file.version.desc())
                        .include("variants", (variants) =>
                            variants
                                .where((row) => row.purpose.eq("thumb"))
                                .select(...mediaThumbFields),
                        ),
                )
                .first();
        } catch (error) {
            throw mapPrismaError(error, "MEDIA_ASSET")
        }
    }
}