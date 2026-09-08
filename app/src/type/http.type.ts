export type HttpClientOptions = {
    input: string;
    init: RequestInit;
}

export type HttpQueryOptions = {
    params?: Record<string, unknown>;
    headers?: HeadersInit;
    signal?: AbortSignal;
}

export type HttpBodyOptions = {
    params?: Record<string, unknown> | FormData;
    headers?: HeadersInit;
    signal?: AbortSignal;
}