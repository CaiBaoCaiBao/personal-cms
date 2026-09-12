import { z } from "zod";

const internalPathSchema = z
    .string()
    .regex(
        /^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+$/,
        "内部路径须为 /a/b 形式",
    );

/** 场景根：公开根 `/`，或单段如 `/admin`、`/test` */
const setPathSchema = z.union([
    z.literal("/"),
    z
        .string()
        .regex(/^\/[a-zA-Z0-9_-]+$/, "场景根路径须为 / 或单段如 /admin"),
]);

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

const scopedFields = {
    ...baseFields,
    scope: z.enum(["admin", "public"]).default("admin"),
};

export const createSystemRouterSchema = z.discriminatedUnion("routeType", [
    // 场景根：结构节点，无 scope；有 path、无 parent（侧栏不渲染自身，子节点上提）
    z.object({
        ...baseFields,
        routeType: z.literal("set"),
        path: setPathSchema,
        parentId: z.undefined().optional(),
        defaultOpen: z.literal(false).default(false),
        scope: z.literal("admin").default("admin"),
    }),

    // 分区：无 path；可挂在 set 下
    z.object({
        ...scopedFields,
        routeType: z.literal("group"),
        path: z.null().optional(),
        parentId: z.string().min(1).optional(),
        defaultOpen: z.literal(false).default(false),
    }),

    // 内部页面
    z.object({
        ...scopedFields,
        routeType: z.literal("page"),
        path: internalPathSchema,
        parentId: z.string().min(1).optional(),
        defaultOpen: z.literal(false).default(false),
    }).refine(
        (data) => data.parentId || data.path.slice(1).split("/").length === 1,
        { message: "无父级时路径只能有一段，如 /admin", path: ["path"] },
    ),

    // 可折叠目录
    z.object({
        ...scopedFields,
        routeType: z.literal("directory"),
        path: internalPathSchema,
        parentId: z.string().min(1).optional(),
        defaultOpen: z.boolean().default(false),
    }).refine(
        (data) => data.parentId || data.path.slice(1).split("/").length === 1,
        { message: "无父级时路径只能有一段，如 /admin", path: ["path"] },
    ),

    // 外链
    z.object({
        ...scopedFields,
        routeType: z.literal("link"),
        path: externalUrlSchema,
        parentId: z.string().min(1).optional(),
        defaultOpen: z.literal(false).default(false),
    }),
]);

export const listSystemRouterQuerySchema = z.object({
    keyword: z.string().trim().min(1).optional(),
    routeType: z.enum(["set", "group", "page", "directory", "link"]).optional(),
    scope: z.enum(["admin", "public"]).optional(),
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
    path: "/admin/example",
    icon: undefined,
    parentId: undefined,
    sortOrder: 0,
    defaultOpen: false,
    routeType: "page",
    isActive: true,
    scope: "admin",
} satisfies CreateSystemRouterFormValues;
