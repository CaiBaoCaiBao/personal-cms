export const ROOT_PARENT_ID = "" as const;

/** @description 规范化父级ID */
export function normalizeParentId(parentId?: string | null) {
    if (parentId == null || parentId === "") return ROOT_PARENT_ID;
    return parentId;
}