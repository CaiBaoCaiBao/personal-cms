import { z } from "zod";

export const paginationSchema = z.object({
    pageIndex: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().min(0).default(0),
    ),
    pageSize: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().min(1).max(100).default(20),
    ),
})

export type PaginationDTO = z.output<typeof paginationSchema>;