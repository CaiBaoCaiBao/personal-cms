import { z } from "zod";

const internalPathSchema = z
    .string()
    .regex(
        /^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+$/,
        "内部路径须为 /a/b 形式",
    );

const externalUrlSchema = z
    .url("外链格式不合法")
    .refine((value) => {
        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }, "外链仅支持 http/https");

const baseFields = {
    name: z.string().min(1, "名称不能为空"),
    icon: z.string().min(1).optional(),
    sortOrder: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
};

export const createSystemRouterSchema = z.discriminatedUnion("routeType", [
    // 分区：无 path、无 parent
    z.object({
        ...baseFields,
        routeType: z.literal("group"),
        path: z.null().optional(),          // 或不传
        parentId: z.undefined().optional(), // 禁止父级
        defaultOpen: z.literal(false).default(false),
    }),

    // 内部页面
    z.object({
        ...baseFields,
        routeType: z.literal("page"),
        path: internalPathSchema,
        parentId: z.string().min(1).optional(),
        defaultOpen: z.literal(false).default(false),
    }),

    // 可折叠目录
    z.object({
        ...baseFields,
        routeType: z.literal("directory"),
        path: internalPathSchema,
        parentId: z.string().min(1).optional(),
        defaultOpen: z.boolean().default(false),
    }),

    // 外链
    z.object({
        ...baseFields,
        routeType: z.literal("link"),
        path: externalUrlSchema,
        parentId: z.string().min(1).optional(),
        defaultOpen: z.literal(false).default(false),
    }),
]);

export const listSystemRouterQuerySchema = z.object({
    keyword: z.string().trim().min(1).optional(),
    routeType: z.enum(["group", "page", "directory", "link"]).optional(),
    isActive: z
        .enum(["true", "false"])
        .optional()
        .transform((value) =>
            value === undefined ? undefined : value === "true",
        ),
});

export const parentOptionsQuerySchema = z.object({
    excludeId: z.string().min(1).optional(),
});

/** @deprecated 使用 listSystemRouterQuerySchema */
export const paginationQuerySchema = listSystemRouterQuerySchema;

export type CreateSystemRouterFormValues = z.input<typeof createSystemRouterSchema>;
export type CreateSystemRouterDTO = z.output<typeof createSystemRouterSchema>;
export type ListSystemRouterQueryDTO = z.infer<typeof listSystemRouterQuerySchema>;
export type ParentOptionsQueryDTO = z.infer<typeof parentOptionsQuerySchema>;
export type PaginationQueryDTO = ListSystemRouterQueryDTO;

export const defaultValueCreateSystemRouter: CreateSystemRouterFormValues = {
    name: "",
    path: "/admin",
    icon: undefined,
    parentId: undefined,
    sortOrder: 0,
    defaultOpen: false,
    routeType: "directory",
    isActive: true,
} satisfies CreateSystemRouterFormValues;