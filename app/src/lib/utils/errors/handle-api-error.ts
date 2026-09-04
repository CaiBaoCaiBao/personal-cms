import "server-only";

import { AppError } from "./app-error";
import { mapPrismaError } from "./map-prisma-error";
import { NextResponse } from "next/server";

export function handleApiError(error: unknown) {
    const appError =
        error instanceof AppError ? error : mapPrismaError(error);
    if (!appError) {
        console.error(error);
        return new AppError(
            "INTERNAL_ERROR",
            "未知错误",
            500,
            undefined,
            false,
        );
    }
    if (!appError.isOperational) {
        // 非预期错误：记录完整堆栈
        console.error(error);
    }
    return NextResponse.json(
        {
            ok: false,
            error: {
                code: appError.code,
                message: appError.message,
                details: appError.details,
                timestamp: new Date().toISOString(),
            },
        },
        { status: appError.status },
    );
}