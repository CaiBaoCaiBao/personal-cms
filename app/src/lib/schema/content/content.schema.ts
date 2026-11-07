import { z } from "zod";

const contentType = ["ARTICLE", "LONG_FORM"] as const;

const baseSchema = {
    type: z.enum(contentType),
    htmlContent: z.string().trim().min(1).nullable().default(null),
    jsonContent: z.string().trim().min(1).nullable().default(null),
}

export const contentSchema = z.discriminatedUnion("status", [
    z.object({
        status: z.literal("DRAFT"),
        title: z.string().trim().min(1).nullable().default(null),
        ...baseSchema
    }),
    z.object({
        status: z.literal("PUBLISHED"),
        title: z.string().trim().min(1),

        ...baseSchema
    })
]);

export const contentQuerySchema = z.object({
    title: z.string().trim().min(1).optional(),
    type: z.enum(contentType).default("ARTICLE"),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export type ContentQueryDTO = z.output<typeof contentQuerySchema>;