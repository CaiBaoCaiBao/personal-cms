import {
    environmentManager,
    QueryClient,
} from "@tanstack/react-query";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // SSR 数据在这段时间内视为新鲜，避免 hydrate 后立刻 refetch
                staleTime: 30_000,
                refetchOnWindowFocus: false,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

/** 服务端每次请求新建；浏览器复用单例，供 Provider / prefetch 共用 */
export function getQueryClient() {
    if (environmentManager.isServer()) {
        return makeQueryClient();
    }
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
}
