import type { RouteType } from "@/type/system-router.type";

export const ROUTE_TYPE_LABEL_MAP = {
    group: "分组",
    directory: "目录",
    page: "页面",
    link: "外链",
} as const satisfies Record<RouteType, string>;

export const ROUTE_TYPE_LABEL = (
    Object.entries(ROUTE_TYPE_LABEL_MAP) as [RouteType, string][]
).map(([value, label]) => ({ value, label }));