import type { RouteScope, RouteType } from "@/type/system-router.type";

export const ROUTE_TYPE_LABEL_MAP = {
    set: "场景根",
    group: "分组",
    directory: "目录",
    page: "页面",
    link: "外链",
} as const satisfies Record<RouteType, string>;

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
