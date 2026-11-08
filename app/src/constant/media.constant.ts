import { MediaFileQueryDTO } from "@/lib/schema/media/media-file.schema";
import { PaginationQuery } from "@/types/globals.type";
const BASE = "media-file" as const;

export const MEDIA_FILE_QUERY_KEY = {
    lists: () => [BASE, "list"] as const,
    pagination: (query: MediaFileQueryDTO, page: PaginationQuery) =>
        [BASE, "list", query, page] as const,
}

export const MEDIA_FILE_MUTATION_KEY = {
    create: () => [BASE, "create"] as const,
}