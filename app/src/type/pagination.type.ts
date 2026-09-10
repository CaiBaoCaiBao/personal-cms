export type Pagination<T> = {
    list: T[];
    total: number;
    pageNumber: number;
    pageSize: number;
}