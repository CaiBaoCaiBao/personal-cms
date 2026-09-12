import { z } from "zod";

const contentCategorySlugSchema = z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .pipe(
        z
            .string()
            .min(2, "slug 至少 2 个字符")
            .max(128, "slug 最多 128 个字符")
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
                "slug 仅允许小写字母、数字与连字符，层级用 / 分隔",
            )
            .refine(
                (value) => value.split("/").every((segment) => segment.length >= 2),
                "slug 每一段至少 2 个字符",
            ),
    );

export const saveContentCategorySchema = z.object({
    name: z.string().trim().min(1),
    slug: contentCategorySlugSchema,
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    parentId: z.string().optional(),
    sortOrder: z.coerce.number().default(0),
});

export const listContentCategorySchema = z.object({
    keyword: z.string().trim().min(1).optional(),
    isActive: z
        .enum(["true", "false"])
        .optional()
        .transform((value) =>
            value === undefined ? undefined : value === "true",
        ),
})

export type SaveContentCategoryFormValues = z.input<typeof saveContentCategorySchema>;
export type SaveContentCategoryDto = z.output<typeof saveContentCategorySchema>;
export type ListContentCategoryQueryDTO = z.infer<typeof listContentCategorySchema>;

export const defaultValueSaveForm: SaveContentCategoryFormValues = {
    name: "",
    slug: "",
    description: undefined,
    isActive: true,
    parentId: undefined,
    sortOrder: 0,
}