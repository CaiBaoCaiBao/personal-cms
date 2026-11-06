import "server-only";
import { serverEnvConfig } from "@/config/server-env.config";
import qiniu, { rs as qiniuRs } from "qiniu";
import { MediaFileDTO } from "@/lib/schema/media/media-file.schema";
import { MediaFileDao, MediaFileQuery, type MediaFileInput } from "../dao";
import { ConflictError } from "../errors";
import { MediaFileList } from "@/types/media.type";
import { PaginationQuery, PaginationResponse } from "@/types/globals.type";

export class MediaFileService {
    static readonly ak = serverEnvConfig.qiniu.accessKey;
    static readonly sk = serverEnvConfig.qiniu.secretKey;
    static readonly domain = serverEnvConfig.qiniu.domain;
    static readonly bucket = serverEnvConfig.qiniu.bucket;
    static readonly mc = new qiniu.auth.digest.Mac(this.ak, this.sk);

    /** @description 生成上传凭证 */
    static async generateUploadToken(
        key: string,
        hash: string,
        expires: number = 3600
    ): Promise<string> {
        const existedFile = await MediaFileDao.queryByHash(hash);
        if (existedFile) {
            throw new ConflictError("MEDIA", "Media file content already exists");
        }
        const options: qiniuRs.PutPolicyOptions = {
            scope: this.bucket + ":" + key,
            expires: expires,
            returnBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize)}',
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        return putPolicy.uploadToken(this.mc);
    }

    /** @description 创建媒体文件 */
    static async create(dto: MediaFileDTO): Promise<void> {
        const existedPath = await MediaFileDao.queryByStorageKey(dto.storageKey);
        if (existedPath) {
            throw new ConflictError("MEDIA", "Media file path already exists");
        }
        const data: MediaFileInput = {
            ...dto,
            url: this.domain + "/" + dto.storageKey,
        }
        await MediaFileDao.insert(data);
    }

    /** @description 删除媒体文件 */
    static async remove(id: string): Promise<string> {
        const storageKey = await MediaFileDao.delete(id);
        return storageKey;
    }

    static async pagination(
        dto: Partial<MediaFileQuery> = {},
        page: PaginationQuery
    ): Promise<PaginationResponse<MediaFileList>> {
        const { list, total } = await MediaFileDao.query(dto, page);
        return {
            data: list,
            total,
            pageIndex: page.pageIndex,
            pageSize: page.pageSize,
        }
    }
}