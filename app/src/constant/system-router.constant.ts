import type { RouteScope, RouteType } from "@/type/system-router.type";

export const ROUTE_TYPE_LABEL_MAP = {
    set: "场景根",
    group: "分组",
    directory: "目录",
    page: "页面",
    button: "按钮",
    link: "外链",
} as const satisfies Record<RouteType, string>;

/** 子类型允许的父类型；set 无父级。page 可挂 set/group/directory；button 只能挂 page。 */
export const ROUTE_PARENT_TYPES = {
    set: [] as const,
    group: ["set"] as const,
    directory: ["set", "group", "directory"] as const,
    page: ["set", "group", "directory"] as const,
    button: ["page"] as const,
    link: ["set", "group", "directory", "page"] as const,
} as const satisfies Record<RouteType, readonly RouteType[]>;

export const ROUTE_PARENT_HINT: Record<RouteType, string> = {
    set: "",
    group: "仅可选场景根；留空则为顶部分区",
    directory: "可选场景根、分组或目录（可多层嵌套）；留空则为根级",
    page: "可选场景根、分组或目录；留空则为根级",
    button: "必须挂在页面下，作为页内站内跳转",
    link: "可选场景根、分组、目录或页面；留空则为根级",
};

export const ROUTE_TYPE_LABEL = (
    Object.entries(ROUTE_TYPE_LABEL_MAP) as [RouteType, string][]
).map(([value, label]) => ({ value, label }));

export const ROUTE_SCOPE_LABEL_MAP = {
    admin: "后台",
    public: "公开",
} as const satisfies Record<RouteScope, string>;

export const ROUTE_SCOPE_LABEL = (
    Object.entries(ROUTE_SCOPE_LABEL_MAP) as [RouteScope, string][]
).map(([value, label]) => ({ value, label }));
