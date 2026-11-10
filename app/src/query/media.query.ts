import { MEDIA_FILE_QUERY_KEY } from "@/constant/media.constant";
import { queryOptions } from "@tanstack/react-query";
import { MediaFileQueryDTO } from "@/lib/schema/media/media-file.schema";
import { PaginationQuery } from "@/types/globals.type";

export class MediaQuery {
    static pagination(query: MediaFileQueryDTO, page: PaginationQuery) {
        return queryOptions({
            queryKey: MEDIA_FILE_QUERY_KEY.pagination(query, page),
            queryFn: async () => {
               // 查询占位
            },
        })
    }

    static categories() {
        return queryOptions({
            queryKey: MEDIA_FILE_QUERY_KEY.categories(),
            queryFn: async () => {
                // 查询分类占位
            }
        })
    }
}