import { z } from "zod";

const baseFields = {
  name: z.string().min(1, "名称不能为空"),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  icon: z.string().min(1).optional(),
}

const pathSchema = z
  .string()
  .min(1, "path 不能为空")
  .regex(/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/, "path 格式非法")
  .refine((p) => !p.endsWith("/") || p === "/", "path 不能以 / 结尾");

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

export const saveSystemRouterSchema = z.discriminatedUnion("routeType", [
  // set ：根节点，有 path、无 parentId
  z.object({
    ...baseFields,
    routeType: z.literal("set"),
    path: pathSchema,
    parentId: z.undefined().optional(),
    isFold: z.literal(false).default(false),
  }),

  // group ：无 path，挂 set 下
  z.object({
    ...baseFields,
    routeType: z.literal("group"),
    path: z.null().optional(),
    parentId: z.string().min(1).optional(),
    isFold: z.literal(false).default(false),
  }),

  // directory ：可有 path，挂 group 下
  z.object({
    ...baseFields,
    routeType: z.literal("directory"),
    path: pathSchema.optional(),
    parentId: z.string().min(1).optional(),
    isFold: z.boolean().default(false),
  }).refine((data) =>
    data.parentId || (data.path?.slice(1).split("/").length ?? 0) > 1,
    { message: "无父级时路径只能有一段，如 /example", path: ["path"] },
  ),

  // page： 必须有path，可挂在 set、group、directory 下
  z.object({
    ...baseFields,
    routeType: z.literal("page"),
    path: pathSchema,
    parentId: z.string().min(1).optional(),
    isFold: z.boolean().default(false),
  }).refine(
    (data) => data.parentId || data.path.slice(1).split("/").length === 1,
    { message: "无父级时路径只能有一段，如 /example", path: ["path"] },
  ),

  // button： 必须有path，只能挂在 directory(有path) 和 page 下
  z.object({
    ...baseFields,
    routeType: z.literal("button"),
    path: pathSchema,
    parentId: z.string().min(1,"父级不能为空"),
    isFold: z.boolean().default(false),
  }),

  // link： 必须有path，只能挂在 directory(有path) 和 page 下
  z.object({
    ...baseFields,
    routeType: z.literal("link"),
    path: externalUrlSchema,
    parentId: z.string().min(1).optional(),
    isFold: z.literal(false).default(false),
  })
]);

export type SaveSystemRouterForm = z.input<typeof saveSystemRouterSchema>;
export type SaveSystemRouterDTO = z.output<typeof saveSystemRouterSchema>;

export const defaultSaveSystemRouterForm: SaveSystemRouterForm = {
  name: "",
  sortOrder: 0,
  isActive: true,
  routeType: "page",
  path: "",
  icon: undefined,
  parentId: undefined,
  isFold: false,
};