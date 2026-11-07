export type Module =
    | "MEDIA_FILE"
    | "CONTENT"
    | "JSON_CONTENT"
    | "HTML_CONTENT"
    | "ARTICLE";

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

export type MatchModule = | "exact" | "prefix" | "regex" | "contain";