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
import { createReadStream } from "fs";
import { Readable } from "stream";
import crypto from "crypto";
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