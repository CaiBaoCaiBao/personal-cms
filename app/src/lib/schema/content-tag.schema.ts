import { z } from "zod";

export const contentSlugSchema = z
    .string()
    .trim()
    .transform((s) => s.toLowerCase()) // 可选：统一小写
    .pipe(
        z
            .string()
            .min(2, "slug 至少 2 个字符")
            .max(64, "slug 最多 64 个字符")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 仅允许小写字母、数字与单个连字符"),
    );

export const createContentTagSchema = z.object({
    name: z.string().trim().min(1),
    slug: contentSlugSchema,
    description: z.string(),
    isActive: z.boolean().default(true),
});

export const pageQuerySchema = z.object({
    pageNumber: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).default(1),
    isActive: z
        .enum(["true", "false"])
        .optional()
        .transform((value) =>
            value === undefined ? undefined : value === "true",
        ),
    keyword: z.string().trim().optional()
});

export type CreateContentTagFormValues = z.input<typeof createContentTagSchema>;
export type CreateContentTagDto = z.output<typeof createContentTagSchema>;
export type PageQueryDto = z.infer<typeof pageQuerySchema>;

export const defaultValueEditForm: CreateContentTagFormValues = {
    name: "",
    slug: "",
    description: "",
    isActive: true,
}

export const defaultValuePageQuery: PageQueryDto = {
    pageNumber: 1,
    pageSize: 10,
    isActive: undefined,
    keyword: undefined,
}