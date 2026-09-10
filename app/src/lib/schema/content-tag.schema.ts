import { z } from "zod";

export const createContentTagSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string(),
    color: z.string(),
    isActive: z.boolean().default(true),
});

export const pageQuerySchema = z.object({
    pageNumber: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).default(10),
});

export type CreateContentTagDto = z.infer<typeof createContentTagSchema>;
export type PageQueryDto = z.infer<typeof pageQuerySchema>;