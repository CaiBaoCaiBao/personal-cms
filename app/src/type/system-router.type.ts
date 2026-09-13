import type { FieldInputTypes, FieldOutputTypes } from "@/prisma/contract";
import type { ListSystemRouterQueryDTO } from "@/lib/schema/system-router.schema";

export type RouteType = FieldInputTypes["public"]["SystemRouter"]["routeType"];
export type RouteScope = FieldInputTypes["public"]["SystemRouter"]["scope"];

type SystemRouterFields = FieldInputTypes["public"]["SystemRouter"];
export type SystemRouterRow = FieldOutputTypes["public"]["SystemRouter"];

/** 创建时写入 ORM 的字段（去掉 id / 时间戳） */
export type InputSystemRouter = Pick<
    SystemRouterFields,
    | "name"
    | "path"
    | "icon"
    | "parentId"
    | "routeType"
    | "sortOrder"
    | "defaultOpen"
    | "isActive"
    | "scope"
>;

/** 侧栏组装用的扁平行 */
export type SystemRouterNavRow = Pick<
    SystemRouterRow,
    | "id"
    | "name"
    | "path"
    | "icon"
    | "parentId"
    | "routeType"
    | "sortOrder"
    | "defaultOpen"
>;

/** 单个菜单节点（对应 SidebarMenuItem / SubItem） */
export type AdminNavItem = {
    id: string;
    title: string;
    path: string | null;
    routeType: RouteType;
    icon?: string | null;
    defaultOpen?: boolean;
    children?: AdminNavItem[];
};

/** 侧栏分区（对应 SidebarGroup + 可选 Label） */
export type AdminNavGroup = {
    title?: string;
    items: AdminNavItem[];
};

/** 父级下拉选项 */
export type SystemRouterParentOption = {
    id: string;
    name: string;
    path: string | null;
    routeType: Extract<RouteType, "set" | "group" | "directory" | "page">;
};

/** 列表行VO */
export type SystemRouterListVO = {
    id: string;
    name: string;
    path: string | null;
    icon: string | null;
    parentId: string | null;
    /** 展示用：父级名称，没有则 null */
    parentName: string | null;
    routeType: RouteType;
    /** 展示用文案，避免列里写 switch */
    routeTypeLabel: string;
    sortOrder: number;
    defaultOpen: boolean;
    isActive: boolean;
    scope: RouteScope;
    createdAt: string;
    updatedAt: string;
};

export type SystemRouterTreeNode = SystemRouterListVO & {
    children?: SystemRouterTreeNode[];
};

export type PageOptions = {
    params: ListSystemRouterQueryDTO;
};

export type FormOptions = {
    id?: string;
    parentRouters: SystemRouterParentOption[];
    initialData?: SystemRouterListVO;
};