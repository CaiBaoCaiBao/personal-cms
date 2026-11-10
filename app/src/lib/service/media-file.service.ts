import "server-only";
import { serverEnvConfig } from "@/config/server-env.config";
import qiniu, { rs as qiniuRs } from "qiniu";
import { QiniuUploadError } from "@/lib/utils";

export class MediaFileService {
    static readonly ak = serverEnvConfig.qiniu.accessKey;
    static readonly sk = serverEnvConfig.qiniu.secretKey;
    static readonly domain = serverEnvConfig.qiniu.domain;
    static readonly bucket = serverEnvConfig.qiniu.bucket;
    static readonly mc = new qiniu.auth.digest.Mac(this.ak, this.sk);

    // ===============================================
    // ============ 七牛云操作 ========================
    // ===============================================

    /** @description 生成上传凭证 */
    static async generateUploadToken(
        key: string,
        hash: string,
        expires: number = 3600
    ): Promise<string> {
        // const existedFile = await MediaFileDao.queryByHash(hash);
        // if (existedFile) {
        //     throw new ConflictError("MEDIA_FILE", "Media file content already exists");
        // }
        const options: qiniuRs.PutPolicyOptions = {
            scope: this.bucket + ":" + key,
            expires: expires,
            returnBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize)}',
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        return putPolicy.uploadToken(this.mc);
    }

    /** @description 从七牛删除文件 */
    private static async removeFromQiniu(storageKey: string): Promise<void> {
        const config = new qiniu.conf.Config();
        config.zone = qiniu.zone.Zone_z2;
        const bucketManager = new qiniu.rs.BucketManager(this.mc, config);
        const result = await bucketManager.delete(this.bucket, storageKey);
        const status = result.resp.statusCode;
        if (status === 612) return;
        if (!result.ok()) {
            throw new QiniuUploadError(result.data?.error || "删除七牛文件失败", { status });
        }
        return;
    }
}