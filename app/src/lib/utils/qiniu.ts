import { createReadStream } from "fs";
import { Readable } from "stream";
import crypto from "crypto";
import qiniu from "qiniu";

type ReturnBody = {
    key: string;
    hash: string;
    size: number;
}

export class QiniuUploadError extends Error {
    readonly status?: number;

    constructor(message: string, options?: { status?: number; cause?: unknown }) {
        super(message, { cause: options?.cause });
        this.name = "QiniuUploadError";
        this.status = options?.status;
    }
}

function isReturnBody(value: unknown): value is ReturnBody {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const body = value as Record<string, unknown>;
    return typeof body.key === "string"
        && typeof body.hash === "string"
        && typeof body.size === "number";
}

async function readQiniuError(response: Response): Promise<string> {
    const text = await response.text();
    if (!text) {
        return response.statusText || "上传七牛失败";
    }
    try {
        const body = JSON.parse(text) as { error?: unknown };
        if (typeof body.error === "string" && body.error) {
            return body.error;
        }
    } catch {
        return text;
    }
    return text;
}

export class Qiniu {
    public static readonly UPLOAD_HOST = "https://upload-z2.qiniup.com" as const;

    /**
     * @description 按七牛 qetag 计算文件摘要。不超过 4MiB 为 0x16 + SHA-1(全文)；超过 4MiB 时按 4MiB 分块，结果为 0x96 + SHA-1(各块 SHA-1 的拼接)。
     * @param input 文件内容、可读流或文件路径
     * @param callback 计算完成回调。失败时 error 不为空
     * @example
     * Qiniu.getEtag("D:/media/a.png", (error, etag) => {
     *     if (error) throw error;
     *     console.log(etag);
     * });
     *
     * Qiniu.getEtag(Buffer.from("hello"), (error, etag) => {
     *     if (error) throw error;
     *     console.log(etag);
     * });
     */
    static getEtag(
        input: Buffer | string | Readable,
        callback: (error: Error | null, etag: string) => void
    ): void {
        const blockSize = 4 * 1024 * 1024;
        const blockHashes: Buffer[] = [];
        let blockCount = 0;
        let settled = false;

        const sha1 = (content: Buffer) => {
            return crypto.createHash("sha1").update(content).digest();
        };

        const finish = (error: Error | null, etag = "") => {
            if (settled) {
                return;
            }
            settled = true;
            callback(error, etag);
        };

        const calcEtag = () => {
            if (blockCount === 0) {
                blockHashes.push(sha1(Buffer.alloc(0)));
                blockCount = 1;
            }

            let prefix = 0x16;
            let digest = Buffer.concat(blockHashes, blockCount * 20);
            if (blockCount > 1) {
                prefix = 0x96;
                digest = sha1(digest);
            }

            return Buffer.concat([Buffer.from([prefix]), digest])
                .toString("base64")
                .replace(/\//g, "_")
                .replace(/\+/g, "-");
        };

        if (typeof input === "string" || input instanceof Readable) {
            const stream = typeof input === "string" ? createReadStream(input) : input;
            const pending: Buffer[] = [];
            let pendingLength = 0;

            const take = (size: number) => {
                const block = Buffer.allocUnsafe(size);
                let offset = 0;
                while (offset < size) {
                    const head = pending[0];
                    const need = size - offset;
                    if (head.length <= need) {
                        head.copy(block, offset);
                        offset += head.length;
                        pending.shift();
                        pendingLength -= head.length;
                    } else {
                        head.copy(block, offset, 0, need);
                        pending[0] = head.subarray(need);
                        pendingLength -= need;
                        offset += need;
                    }
                }
                return block;
            };

            stream.on("data", (chunk: Buffer) => {
                pending.push(chunk);
                pendingLength += chunk.length;
                while (pendingLength >= blockSize) {
                    blockHashes.push(sha1(take(blockSize)));
                    blockCount++;
                }
            });
            stream.on("end", () => {
                if (pendingLength > 0) {
                    blockHashes.push(sha1(take(pendingLength)));
                    blockCount++;
                }
                finish(null, calcEtag());
            });
            stream.on("error", (error: Error) => finish(error));
            return;
        }

        blockCount = Math.ceil(input.length / blockSize);
        for (let i = 0; i < blockCount; i++) {
            blockHashes.push(sha1(input.subarray(i * blockSize, (i + 1) * blockSize)));
        }
        queueMicrotask(() => finish(null, calcEtag()));
    }

    /** @description 构建对象键 */
    static buildObjectKey(id: string, filename: string): string {
        const now = new Date();
        const yyyy = String(now.getFullYear());
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dot = filename.lastIndexOf(".");
        const ext = dot > 0 ? filename.substring(dot).toLowerCase() : "";
        return `${yyyy}/${mm}/${id}${ext}`;
    }

    /** @description 将文件直传到七牛。失败时抛出 QiniuUploadError，并带上七牛的状态码和错误信息。 */
    static async uploadToQiniu(
        file: File,
        token: string,
        key: string
    ): Promise<ReturnBody> {
        const form = new FormData();
        form.append("file", file);
        form.append("token", token);
        form.append("key", key);

        let response: Response;
        try {
            response = await fetch(Qiniu.UPLOAD_HOST, {
                method: "POST",
                body: form,
            });
        } catch (error) {
            throw new QiniuUploadError("上传七牛失败", { cause: error });
        }

        if (!response.ok) {
            throw new QiniuUploadError(await readQiniuError(response), {
                status: response.status,
            });
        }

        let body: unknown;
        try {
            body = await response.json();
        } catch (error) {
            throw new QiniuUploadError("七牛返回的上传结果无效", {
                status: response.status,
                cause: error,
            });
        }
        if (!isReturnBody(body)) {
            throw new QiniuUploadError("七牛返回的上传结果无效", {
                status: response.status,
            });
        }
        return body;
    }

    /** @description 从七牛删除文件 */
    static async removeFromQiniu(mc: qiniu.auth.digest.Mac, bucket: string, storageKey: string): Promise<void> {
        const config = new qiniu.conf.Config();
        config.zone = qiniu.zone.Zone_z2;
        const bucketManager = new qiniu.rs.BucketManager(mc, config);
        const result = await bucketManager.delete(bucket, storageKey);
        const status = result.resp.statusCode;
        if (status === 612) return;
        if (!result.ok()) {
            throw new QiniuUploadError(result.data?.error || "删除七牛文件失败", { status });
        }
        return;
    }
}
