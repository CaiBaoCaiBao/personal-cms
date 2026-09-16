import "server-only";
import { z } from "zod";
import { mapZodError } from "./errors/map-zod-error";

export async function parseJsonBody<T extends z.ZodType>(
    req: Request,
    schema: T,
): Promise<z.infer<T>> {
    const raw = await req.json();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        throw mapZodError(parsed.error);
    }
    return parsed.data;
}

export async function parseQueryParams<T extends z.ZodType>(
    req: Request, schema: T
): Promise<z.infer<T>> {
    const { searchParams } = new URL(req.url);
    const raw: Record<string, string | string[]> = {};
    for (const key of new Set(searchParams.keys())) {
        const values = searchParams.getAll(key);
        raw[key] = values.length === 1 ? values[0]! : values;
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        throw mapZodError(parsed.error);
    }
    return parsed.data;
}