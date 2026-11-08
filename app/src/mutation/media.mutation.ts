import { FileMetadata } from "@/components/file-upload/type";
import { MEDIA_FILE_MUTATION_KEY } from "@/constant/media.constant";
import { mutationOptions } from "@tanstack/react-query";
import { Qiniu } from "@/lib/utils";
import { getUploadToken, createMediaFile } from "@/lib/action/media.action";
import { toast } from "@/components/ui/toast";

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback;
}

export class MediaMutation {
    static upload() {
        return mutationOptions({
            mutationKey: MEDIA_FILE_MUTATION_KEY.create(),
            mutationFn: async (item: FileMetadata) => {
                try {
                    const storageKey = Qiniu.buildObjectKey(item.id, item.file.name);
                    const hash = await Qiniu.getEtag(item.file);
                    const token = await getUploadToken({
                        key: storageKey,
                        hash
                    });
                    if (!token.ok || !token.data) {
                        throw new Error(token.ok ? "上传凭证为空" : token.error.message);
                    }
                    const uploadRes = await Qiniu.uploadToQiniu(item.file, token.data, storageKey);
                    const created = await createMediaFile({
                        originalName: item.file.name,
                        storageKey: uploadRes.key,
                        hash: uploadRes.hash,
                        mimeType: item.file.type,
                        size: uploadRes.size,
                        durationMs: null,
                    });
                    if (!created.ok) {
                        throw new Error(created.error.message);
                    }
                } catch (error) {
                    throw new Error(`${item.file.name}: ${errorMessage(error, "上传失败")}`);
                }
            },
            onError: (error) => {
                toast.add({
                    title: "文件上传失败",
                    description: errorMessage(error, "上传失败"),
                    type: "error",
                });
            },
            retry: false,
        })
    }
}