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

    /**
     * @description 按七牛 qetag 计算文件摘要。不超过 4MiB 为 0x16 + SHA-1(全文)；超过 4MiB 时按 4MiB 分块，结果为 0x96 + SHA-1(各块 SHA-1 的拼接)。
     */
    static async getEtag(file: Blob): Promise<string> {
        const blockSize = 4 * 1024 * 1024;
        const sha1 = async (content: BufferSource) => {
            return new Uint8Array(await crypto.subtle.digest("SHA-1", content));
        };
        const blockHashes: Uint8Array[] = [];

        if (file.size === 0) {
            blockHashes.push(await sha1(new Uint8Array()));
        } else {
            const blockCount = Math.ceil(file.size / blockSize);
            for (let index = 0; index < blockCount; index++) {
                const start = index * blockSize;
                const end = Math.min(start + blockSize, file.size);
                blockHashes.push(await sha1(await file.slice(start, end).arrayBuffer()));
            }
        }

        let prefix = 0x16;
        let digest = blockHashes[0];
        if (blockHashes.length > 1) {
            prefix = 0x96;
            const joined = new Uint8Array(blockHashes.length * digest.length);
            blockHashes.forEach((hash, index) => joined.set(hash, index * digest.length));
            digest = await sha1(joined);
        }

        const payload = new Uint8Array(1 + digest.length);
        payload[0] = prefix;
        payload.set(digest, 1);
        let binary = "";
        for (const byte of payload) {
            binary += String.fromCharCode(byte);
        }
        return btoa(binary).replace(/\//g, "_").replace(/\+/g, "-");
    }
}
