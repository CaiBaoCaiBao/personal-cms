import { AppErrorCode } from "./error.type";

export type ApiSuccess<T extends unknown> = {
    ok: true;
    data: T;
    timestamp: string;
}

export type ApiFailure = {
    ok: false;
    error: {
        code: AppErrorCode;
        message: string;
        details?: unknown;
    };
    timestamp: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;