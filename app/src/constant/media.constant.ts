const BASE = "media-file" as const;

export const MEDIA_FILE_QUERY_KEY = {
    lists: () => [BASE, "list"] as const,
}

export const MEDIA_FILE_MUTATION_KEY = {
    create: () => [BASE, "create"] as const,
}