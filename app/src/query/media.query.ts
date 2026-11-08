import { MEDIA_FILE_QUERY_KEY } from "@/constant/media.constant";
import { queryOptions } from "@tanstack/react-query";
import { MediaFileQueryDTO } from "@/lib/schema/media/media-file.schema";
import { PaginationQuery } from "@/types/globals.type";
import { getMediaPagination } from "@/lib/action/media.action";

export class MediaQuery {
    static pagination(query: MediaFileQueryDTO, page: PaginationQuery) {
        return queryOptions({
            queryKey: MEDIA_FILE_QUERY_KEY.pagination(query, page),
            queryFn: async() => {
                const res = await getMediaPagination({ ...query, ...page });
                if(!res.ok) throw new Error(res.message);
                return res.data;
            },
        })
    }
}