import { z } from "zod";

export const mediaFileSchema = z.object({
    originalName: z.string().trim().min(1),
    storageKey: z.string().trim().min(1),
    hash:z.string().trim().min(1),
    mimeType: z.string().trim().min(1),
    size: z.number().int().positive(),
    durationMs: z.number().int().positive().nullable().default(null),
});

export const mediaFileQuerySchema = z.object({
    originalName: z.string().trim().min(1).optional(),
    mimeType: z.string().trim().min(1).optional(),
    createdFrom: z.iso.datetime().optional(),
    createdTo: z.iso.datetime().optional(),
})

export type MediaFileDTO = z.output<typeof mediaFileSchema>;
export type MediaFileQueryDTO = z.output<typeof mediaFileQuerySchema>;