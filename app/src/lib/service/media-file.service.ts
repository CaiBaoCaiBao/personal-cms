import "server-only";
import { serverEnvConfig } from "@/config/server-env.config";
import qiniu, { rs as qiniuRs } from "qiniu";
import {
    MediaFileDTO,
    MediaFileQueryDTO
} from "@/lib/schema/media/media-file.schema";
import { MediaFileDao, type MediaFileInput } from "../dao";
import { ConflictError, NotFoundError } from "../errors";
import { MediaFileDetail, MediaFileList } from "@/types/media.type";
import { PaginationQuery, PaginationResponse } from "@/types/globals.type";
import { QiniuUploadError } from "@/lib/utils";

export class MediaFileService {
    static readonly ak = serverEnvConfig.qiniu.accessKey;
    static readonly sk = serverEnvConfig.qiniu.secretKey;
    static readonly domain = serverEnvConfig.qiniu.domain;
    static readonly bucket = serverEnvConfig.qiniu.bucket;
    static readonly mc = new qiniu.auth.digest.Mac(this.ak, this.sk);

    /** @description 创建媒体文件 */
    static async create(dto: MediaFileDTO): Promise<void> {
        const existedPath = await MediaFileDao.queryByStorageKey(dto.storageKey);
        if (existedPath) {
            throw new ConflictError("MEDIA_FILE", "Media file path already exists");
        }
        const data: MediaFileInput = {
            ...dto,
            url: this.domain + "/" + dto.storageKey,
        }
        await MediaFileDao.insert(data);
    }

    /** @description 删除媒体文件，并从七牛删除文件 */
    static async remove(id: string): Promise<void> {
        const storageKey = await MediaFileDao.delete(id);
        await this.removeFromQiniu(storageKey);
    }

    /** @description 分页查询媒体文件 */
    static async pagination(
        dto: MediaFileQueryDTO = {},
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

    /** @description 库里实际出现过的文件类型 */
    static async listCategories(): Promise<string[]> {
        return MediaFileDao.queryCategories();
    }

    /** @description 获取媒体文件详情 */
    static async getItem(id: string): Promise<MediaFileDetail | null> {
        const item = await MediaFileDao.queryById(id);
        if (!item) throw new NotFoundError("MEDIA_FILE", "Media file not found");
        return item;
    }

    // ===============================================
    // ============ 七牛云操作 ========================
    // ===============================================

    /** @description 生成上传凭证 */
    static async generateUploadToken(
        key: string,
        hash: string,
        expires: number = 3600
    ): Promise<string> {
        const existedFile = await MediaFileDao.queryByHash(hash);
        if (existedFile) {
            throw new ConflictError("MEDIA_FILE", "Media file content already exists");
        }
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