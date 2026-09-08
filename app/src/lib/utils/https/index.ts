import { AppError, ValidationError } from "../errors/app-error";
import {
    HttpBodyOptions,
    HttpClientOptions,
    HttpQueryOptions
} from "@/type/http.type";
import { isEmpty } from "../is-empty";

/**
 * @description 客户端HTTP请求类
 */
export class HTTP {
    /**
    * @description 客户端HTTP请求基类
    */
    private static async httpClient({
        input, init
    }: HttpClientOptions) {
        try {
            const url = decodeURIComponent(input);
            const response = await fetch(url, { ...init });
            if (!response.ok) {
                return new AppError(
                    "INTERNAL_ERROR",
                    "网络请求失败",
                    response.status
                )
            }
            const data = await response.json();
            return data;
        } catch (e) {
            throw new AppError("INTERNAL_ERROR", "网络请求失败")
        }
    }
    private static appendParam(
        query: URLSearchParams,
        key: string,
        value: unknown,
    ) {
        if (isEmpty(value)) return;
        if (Array.isArray(value)) {
            for (const item of value) {
                this.appendParam(query, key, item);
            }
            return;
        }
        if (typeof value === "object" && value !== null) {
            throw new ValidationError(
                `Query 参数 "${key}" 不能是对象，请改用扁平字段或放入请求体`,
                { key, value: JSON.stringify(value) },
            );
        }
        query.append(key, String(value));
    }
    /**
     * @description 构建查询字符串
     * @param params 查询参数
     * @returns 查询字符串
     */
    private static buildQueryStr(params?: Record<string, unknown>) {
        if (!params || isEmpty(params)) return "";
        const query = new URLSearchParams();
        for (const [field, value] of Object.entries(params)) {
            this.appendParam(query, field, value);
        }
        return query.toString();
    }
    /**
     * @description 构建请求体
     * @param params 请求体参数
     * @returns 请求体
     */
    private static buildBody(params?: Record<string, unknown> | FormData): {
        body?: BodyInit;
        headers?: Record<string, string>;
    } {
        if (!params) {
            return {
                body: undefined,
                headers: { "Content-Type": "application/json" },
            };
        }
        if (params instanceof FormData) {
            return { body: params };
        }
        const hasFile = Object.values(params).some((v) => v instanceof Blob);
        if (hasFile) {
            const form = new FormData();
            for (const [key, value] of Object.entries(params)) {
                if (value == null) continue;
                if (value instanceof Blob) form.append(key, value);
                else form.append(key, String(value));
            }
            return { body: form };
        }
        return {
            body: JSON.stringify(params),
            headers: { "Content-Type": "application/json" },
        };
    }
    /**
     * @description GET请求
     * @param route 请求路径
     * @param options 请求选项
     * @returns 响应数据
     */
    static async GET(route: string, options?: HttpQueryOptions) {
        const { params, headers, signal } = options || {};
        const queryStr = this.buildQueryStr(params);
        const input = queryStr ? `${route}?${queryStr}` : route;
        return await this.httpClient({
            input,
            init: {
                method: "GET",
                headers: {
                    ...headers,
                },
                signal
            }
        })
    }
    /**
     * @description DELETE请求
     * @param route 请求路径
     * @param options 请求选项
     * @returns 响应数据
     */
    static async DELETE(route: string, options?: HttpQueryOptions) {
        const { params, headers, signal } = options || {};
        const queryStr = this.buildQueryStr(params);
        const input = queryStr ? `${route}?${queryStr}` : route;
        return await this.httpClient({
            input,
            init: {
                method: "DELETE",
                headers: {
                    ...headers,
                },
                signal
            }
        })
    }
    /**
     * @description POST请求
     * @param route 请求路径
     * @param options 请求选项
     * @returns 响应数据
     */
    static async POST(route: string, options?: HttpBodyOptions) {
        const { params, headers: optionsHeaders, signal } = options || {};
        const { body, headers } = this.buildBody(params);
        console.log(body, headers);
        return await this.httpClient({
            input: route,
            init: {
                method: "POST",
                headers: {
                    ...optionsHeaders,
                    ...headers,
                },
                signal,
                body
            }
        })
    }
    /**
     * @description PUT请求
     * @param route 请求路径
     * @param options 请求选项
     * @returns 响应数据
     */
    static async PUT(route: string, options?: HttpBodyOptions) {
        const { params, headers: optionsHeaders, signal } = options || {};
        const { body, headers } = this.buildBody(params);
        console.log(body, headers);
        return await this.httpClient({
            input: route,
            init: {
                method: "PUT",
                headers: {
                    ...optionsHeaders,
                    ...headers,
                },
                signal,
                body
            }
        })
    }
}