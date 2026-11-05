import "server-only";
import { serverEnvConfig } from "@/config/server-env.config";
import qiniu from "qiniu";
import { rs as qiniuRs } from "qiniu";

export class MediaFileService {
    static readonly ak = serverEnvConfig.qiniu.accessKey;
    static readonly sk = serverEnvConfig.qiniu.secretKey;
    static readonly domain = serverEnvConfig.qiniu.domain;
    static readonly bucket = serverEnvConfig.qiniu.bucket;
    static readonly mc = new qiniu.auth.digest.Mac(this.ak, this.sk);

    /** @description 生成上传凭证 */
    static async generateUploadToken(
        key: string,
        expires: number = 3600
    ): Promise<string> {
        const options:qiniuRs.PutPolicyOptions = {
            scope: this.bucket + ":" + key,
            expires: expires,
            returnBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize)}',
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        return putPolicy.uploadToken(this.mc);
    }
}