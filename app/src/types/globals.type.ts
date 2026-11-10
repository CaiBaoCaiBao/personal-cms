const MEDIA_MODULE = ["MEDIA_FILE", "MEDIA_FOLDER", "MEDIA_ASSET", "MEDIA_VARIANT"] as const;
const CONTENT_MODULE = ["CONTENT", "JSON_CONTENT", "HTML_CONTENT", "ARTICLE"] as const;

type MediaModule = typeof MEDIA_MODULE[number];
type ContentModule = typeof CONTENT_MODULE[number];

export type Module = MediaModule | ContentModule;

/** @description 分页查询参数 */
export type PaginationQuery = {
    pageIndex: number;
    pageSize: number;
};

/** @description 分页响应 */
export type PaginationResponse<T> = {
    data: T[];
    total: number;
    pageIndex: number;
    pageSize: number;
};

export type MatchModule = | "exact" | "prefix" | "regex" | "contains" | "suffix";

export type ViewMode = "grid" | "list";