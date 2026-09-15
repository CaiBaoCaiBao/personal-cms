import {
    HttpClientOptions,
    HttpQueryOptions,
    HttpBodyOptions,
    UploadProgressOptions
} from './type';
import { isEmpty } from '../is-empty';
import { AppError, ValidationError } from "../errors/app-error";

export class Http {
    /**
     * @description GET请求
     * @param route 请求路径
     * @param options 请求选项
     * @returns 响应数据
     */
    static async get(route: string, options?: HttpQueryOptions) {
        const { params, headers, signal } = options || {};
        const queryStr = this.buildQueryStr(params);
        const input = queryStr ? `${route}?${queryStr}` : route;
        return await this.http({
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
    static async delete(route: string, options?: HttpQueryOptions) {
        const { params, headers, signal } = options || {};
        const queryStr = this.buildQueryStr(params);
        const input = queryStr ? `${route}?${queryStr}` : route;
        return await this.http({
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
    static async post(route: string, options?: HttpBodyOptions) {
        const { params, headers: optionsHeaders, signal } = options || {};
        const { body, headers } = this.buildBody(params);
        return await this.http({
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
    static async put(route: string, options?: HttpBodyOptions) {
        const { params, headers: optionsHeaders, signal } = options || {};
        const { body, headers } = this.buildBody(params);
        return await this.http({
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
    /**
     * @description 需要上传进度的请求
     * @param input 请求路径
     * @param options 上传进度选项
     * @returns 响应数据
     */
    static uploadProgress(input: string, options: UploadProgressOptions) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", input);
            xhr.upload.onprogress = (e) => {
                if (!e.lengthComputable) return;
                options.onProgress && options.onProgress(e.loaded / e.total);
            }
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
                else reject(new AppError("VALIDATION_ERROR", xhr.responseText || "Upload failed"));
            };
            xhr.onerror = () => reject(new AppError("VALIDATION_ERROR", "Upload failed"));
            xhr.send(options.data);
        })
    }
    private static async http({
        input, init
    }: HttpClientOptions) {
        try {
            const url = decodeURIComponent(input);
            const response = await fetch(url, { ...init });

            const data = await response.json();
            return data;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw new AppError("INTERNAL_ERROR", "网络请求失败")
        }
    }
    /**
     * @description 添加查询参数
     * @param query: URLSearchParams 查询参数
     * @param key: string 键
     * @param value: unknown 值
     * @returns void
     */
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
     * 构建查询字符串
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
}