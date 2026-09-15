/**
 * Zod 错误映射
 */
import { ZodError,z } from "zod";
import { ValidationError } from "./app-error";
export function mapZodError(error: ZodError) {
    return new ValidationError("参数校验失败", z.flattenError(error));
}