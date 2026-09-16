import type { FieldInputTypes, FieldOutputTypes } from "@/prisma/contract";

export type RouteType = FieldInputTypes["public"]["SystemRouter"]["routeType"];

type SystemRouterFields = FieldInputTypes["public"]["SystemRouter"];

export type SaveSystemRouterPO = Pick<
    SystemRouterFields,
    | "name"
    | "path"
    | "icon"
    | "parentId"
    | "routeType"
    | "sortOrder"
    | "isFold"
    | "isActive"
>;