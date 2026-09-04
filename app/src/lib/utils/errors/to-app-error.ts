/**
 * @description 将任意的未知错误统一转化为AppError
 */
import "server-only";
import { ZodError } from "zod";
import { AppError } from "./app-error";
import { isAppError } from "./is-app-error";
import { mapPrismaError } from "./map-prisma-error";
import { mapZodError } from "./map-zod-error";

export function toAppError(error: unknown): AppError {
    if (isAppError(error)) return error;
    if (error instanceof ZodError) return mapZodError(error);
    const prismaError = mapPrismaError(error);
    if (prismaError) return prismaError;
    return new AppError(
        "INTERNAL_ERROR",
        "未知错误",
        500,
        undefined,
        false,
    );
}