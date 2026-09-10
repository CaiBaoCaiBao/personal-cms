import "server-only";
import qiniu from "qiniu";
import { serverConfig } from "@/config/env/server-env.config";
import { formatDate, AppError } from "@/lib/utils";

const { qiniu: qiniuConfig } = serverConfig;

const uploadOptions = (key: string, expires: number = 3600) => {
    return {
        scope: `${qiniuConfig.bucket}:${key}`,
        expires
    };
}

export class FileService {
    static getMac() {
        return new qiniu.auth.digest.Mac(qiniuConfig.key.accessKey, qiniuConfig.key.secretKey);
    }
    /** @description 获取上传凭证和访问地址 */
    static async getTokenAndFileUrl(key: string, expires: number = 3600) {
        const mac = this.getMac();
        const putPolicy = new qiniu.rs.PutPolicy(uploadOptions(key, expires));
        const token = putPolicy.uploadToken(mac);
        const base = qiniuConfig.url.replace(/\/$/, "");
        return {
            token,
            url: `${base}/${key}`,
            key
        };
    }
    static buildObjectKey(filename: string) {
        const safe = filename.replace(/[^\w.\-]+/g, "_");
        const now = formatDate(new Date(), "YYYY_MM_DD");
        const randomUUid = crypto.randomUUID();
        return `uploads/${now}-${randomUUid}-${safe}`;
    }
    /** @description 获取七牛云的桶管理器 */
    static getBucketManager() {
        const config = new qiniu.conf.Config();
        const mac = this.getMac();
        config.zone = qiniu.zone.Zone_z2;
        const bucketManager = new qiniu.rs.BucketManager(mac, config);
        return bucketManager;
    }
    static keyFromUrl(url: string): string | null {
        try {
            const base = qiniuConfig.url.replace(/\/$/, "");
            if (!url.startsWith(base + "/") && url !== base) return null;
            return decodeURIComponent(url.slice(base.length + 1));
        } catch {
            return null;
        }
    }
    static async deleteObjectByUrl(url: string) {
        const key = this.keyFromUrl(url);
        if (!key) {
            throw new AppError("NOT_FOUND", "File not found", 404, {
                fields: ["url"],
                values: [url],
                message: "file is not exists or has been deleted",
            });
        }
        await this.deleteObject(key);
    }
    static async deleteObject(key: string) {
        const bucket = qiniuConfig.bucket;
        const bucketManager = this.getBucketManager();
        const { data, resp } = await bucketManager.delete(bucket, key);
        if (resp.statusCode !== 200 && resp.statusCode !== 612) {
            throw new AppError("INTERNAL_ERROR",
                `Delete failed: ${resp.statusCode} ${JSON.stringify(data)}`,
            );
        }
    }
}