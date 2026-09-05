import "server-only";

import { ApiSuccess } from "@/type/api-result.type";
import { NextResponse } from "next/server";
import { handleApiError } from "./handle-api-error";

type RouteHandler<T> = (req: Request) => Promise<ApiSuccess<T>>;

export function apiHandler<T>(
    handler: RouteHandler<T>
) {
    return async (req: Request) => {
        try {
            const result = await handler(req);
            return NextResponse.json(result);
        } catch (error) {
            return handleApiError(error);
        }
    };
}