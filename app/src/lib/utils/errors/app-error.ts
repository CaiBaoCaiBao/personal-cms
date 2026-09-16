import { AppErrorCode } from "@/type/error.type";

/**
 * @description 应用错误基类
 */
export class AppError extends Error {
    constructor(
        public readonly code: AppErrorCode,
        message: string,
        public readonly status: number = 500,
        public readonly details?: unknown,
        public readonly isOperational: boolean = true,
        public readonly timestamp: Date = new Date(),
    ) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, this.constructor);
    }
}

/**
 * @description 校验错误
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super("VALIDATION_ERROR", message, 400, details);
    }
}

/** @description 资源不存在错误 */
export class NotFoundError extends AppError {
    constructor(message = "资源不存在") {
        super("NOT_FOUND", message, 404);
    }
}

/**
 * @description 冲突错误
 */
export class ConflictError extends AppError {
    constructor(message: string, details?: unknown) {
        super("CONFLICT", message, 409, details);
    }
}