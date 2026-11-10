import { z } from "zod";

/** @description YYYY/MM/{uuid}，扩展名可选。与 Qiniu.buildObjectKey 的结果一致。 */
const objectKeySchema = z.string().regex(
    /^\d{4}\/(0[1-9]|1[0-2])\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:\.[^/.][^/]*)?$/,
    "对象键格式应为 YYYY/MM/{uuid}[.ext]",
);

export const mediaFileSchema = z.object({
    originalName: z.string().trim().min(1),
    storageKey: objectKeySchema,
    hash: z.string().trim().min(1),
    mimeType: z.string().trim().min(1),
    size: z.number().int().positive(),
    durationMs: z.number().int().positive().nullable().default(null),
});

export const mediaFileQuerySchema = z.object({
    originalName: z.string().trim().optional(),
    mimeType: z.string().trim().min(1).optional(),
    createdFrom: z.iso.datetime().optional(),
    createdTo: z.iso.datetime().optional(),
})

export const uploadTokenSchema = z.object({
    key: objectKeySchema,
    hash: z.string().trim().min(1),
    expire: z.number().int().positive().optional(),
})

export type UploadTokenForm = z.input<typeof uploadTokenSchema>;
export type UploadTokenDTO = z.output<typeof uploadTokenSchema>;

export type MediaFileForm = z.input<typeof mediaFileSchema>;
export type MediaFileDTO = z.output<typeof mediaFileSchema>;

export type MediaFileQueryForm = z.input<typeof mediaFileQuerySchema>;
export type MediaFileQueryDTO = z.output<typeof mediaFileQuerySchema>;