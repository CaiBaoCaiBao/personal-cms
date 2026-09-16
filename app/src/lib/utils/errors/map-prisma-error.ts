import "server-only";

import {
    isStructuredError,
    type StructuredError,
} from "@prisma/orm-postgres/utils/structured-error";
import { DatabaseError } from "pg";

import {
    AppError,
    ConflictError,
    NotFoundError,
    ValidationError,
} from "./app-error";

type ErrorDetails = Record<string, unknown> | undefined;

function detailsFromStructured(error: StructuredError): ErrorDetails {
    return { prismaCode: error.code, meta: error.meta };
}

function detailsFromPg(error: DatabaseError): ErrorDetails {
    return {
        pgCode: error.code,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table,
        column: error.column,
        schema: error.schema,
    };
}

function findDatabaseError(error: unknown, depth = 0): DatabaseError | undefined {
    if (depth > 5 || error == null) return undefined;
    if (error instanceof DatabaseError) return error;
    if (typeof error === "object" && "cause" in error) {
        return findDatabaseError((error as { cause: unknown }).cause, depth + 1);
    }
    return undefined;
}

function internal(
    error: StructuredError,
    message: string,
    status = 500,
    operational = false,
): AppError {
    return new AppError(
        "INTERNAL_ERROR",
        error.message || message,
        status,
        detailsFromStructured(error),
        operational,
    );
}

function mapPgError(error: DatabaseError): AppError {
    switch (error.code) {
        case "23505":
            return new ConflictError("唯一约束冲突", detailsFromPg(error));
        case "23503":
            return new ConflictError("外键约束冲突", detailsFromPg(error));
        case "23P01":
            return new ConflictError("排他约束冲突", detailsFromPg(error));
        case "23502":
            return new ValidationError("非空约束冲突", detailsFromPg(error));
        case "23514":
            return new ValidationError("检查约束冲突", detailsFromPg(error));
        case "22P02":
            return new ValidationError("数据类型无效", detailsFromPg(error));
        case "22001":
            return new ValidationError("字符串超长", detailsFromPg(error));
        case "22003":
            return new ValidationError("数值超出范围", detailsFromPg(error));
        case "40001":
        case "40P01":
            return new AppError(
                "INTERNAL_ERROR",
                "数据库发生并发冲突，请稍后重试",
                503,
                detailsFromPg(error),
                true,
            );
        case "08006":
        case "08001":
        case "08003":
        case "53300":
        case "57P01":
            return new AppError(
                "INTERNAL_ERROR",
                "数据库连接失败",
                503,
                detailsFromPg(error),
                true,
            );
        case "57014":
            return new AppError(
                "INTERNAL_ERROR",
                "数据库查询已取消",
                408,
                detailsFromPg(error),
                true,
            );
        default:
            return new AppError(
                "INTERNAL_ERROR",
                "数据库操作失败",
                500,
                detailsFromPg(error),
                false,
            );
    }
}

function mapStructuredError(error: StructuredError): AppError {
    if (error.code.startsWith("CONTRACT.")) {
        return internal(error, "合约错误");
    }

    if (error.code.startsWith("DRIVER.")) {
        return internal(error, "数据库驱动错误", 503, true);
    }

    if (error.code.startsWith("BUDGET.")) {
        return internal(error, "查询超出预算限制", 429, true);
    }

    switch (error.code) {
        /**
         * @description ORM 查询/写入语义
         */
        case "ORM.MUTATION_ROW_MISSING":
        case "ORM.RELATION_ROW_MISSING":
            return new NotFoundError(error.message || "资源不存在");
        case "ORM.RELATION_LINK_DUPLICATE":
            return new ConflictError(
                error.message || "关联已存在",
                detailsFromStructured(error),
            );
        case "ORM.ARGUMENT_INVALID":
        case "ORM.MUTATION_DATA_MISSING":
        case "ORM.WHERE_MISSING":
        case "ORM.INCLUDE_INVALID":
        case "ORM.CURSOR_VALUE_MISSING":
        case "ORM.RELATION_MUTATION_INVALID":
        case "ORM.COLUMN_UNKNOWN":
        case "ORM.FIELD_UNKNOWN":
        case "ORM.FILTER_UNSUPPORTED":
        case "ORM.GROUP_BY_FIELD_MISSING":
        case "ORM.HAVING_EXPRESSION_UNSUPPORTED":
        case "ORM.AGGREGATE_SELECTOR_INVALID":
        case "ORM.AGGREGATE_SELECTOR_MISSING":
        case "ORM.OPERATION_UNSUPPORTED":
        case "ORM.RELATION_MUTATION_UNSUPPORTED":
            return new ValidationError(
                error.message || "查询参数无效",
                detailsFromStructured(error),
            );

        /**
         * @description 运行时
         */
        case "RUNTIME.NO_ROWS":
            return new NotFoundError(error.message || "资源不存在");
        case "RUNTIME.ENCODE_FAILED":
        case "RUNTIME.JSON_SCHEMA_VALIDATION_FAILED":
        case "RUNTIME.TYPE_PARAMS_INVALID":
        case "RUNTIME.RAW_SQL_UNSUPPORTED_INTERPOLATION":
        case "RUNTIME.PREPARE_MISSING_PARAM":
            return new ValidationError(
                error.message || "写入数据无效",
                detailsFromStructured(error),
            );
        case "RUNTIME.ABORTED":
            return internal(error, "操作已取消", 408, true);
        case "RUNTIME.TRANSACTION_COMMIT_FAILED":
        case "RUNTIME.TRANSACTION_ROLLBACK_FAILED":
            return internal(error, "事务失败", 500, true);
        case "RUNTIME.BINDING_INVALID":
        case "RUNTIME.BINDING_MISSING":
            return internal(error, "数据库连接配置无效", 503, false);

        default:
            return internal(error, "数据库操作失败");
    }
}

export function mapPrismaError(error: unknown): AppError | null {
    const pgError = findDatabaseError(error);
    if (pgError) {
        return mapPgError(pgError);
    }

    if (isStructuredError(error)) {
        return mapStructuredError(error);
    }

    return null;
}
