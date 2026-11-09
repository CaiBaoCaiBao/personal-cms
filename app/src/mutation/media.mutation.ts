import { FileMetadata } from "@/components/file-upload/type";
import { MEDIA_FILE_MUTATION_KEY, MEDIA_FILE_QUERY_KEY } from "@/constant/media.constant";
import { mutationOptions } from "@tanstack/react-query";
import { Qiniu } from "@/lib/utils";
import { getUploadToken, createMediaFile, removeMediaFile } from "@/lib/action/media.action";
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

    static remove() {
        return mutationOptions({
            mutationKey: MEDIA_FILE_MUTATION_KEY.remove(),
            mutationFn: async (id: string) => {
                try {
                    const res = await removeMediaFile(id);
                    if (!res.ok) throw new Error(res.message);
                } catch (error) {
                    throw new Error(`${id}: ${errorMessage(error, "删除失败")}`);
                }
            },
            onError: (error) => {
                toast.add({
                    title: "文件删除失败",
                    description: errorMessage(error, "删除失败"),
                    type: "error",
                });
            },
            onSuccess: (_data, _id, _result, context) => {
                context.client.invalidateQueries({
                    queryKey: MEDIA_FILE_QUERY_KEY.lists(),
                });
                context.client.invalidateQueries({
                    queryKey: MEDIA_FILE_QUERY_KEY.categories(),
                });
            },
            retry: false,
        })
    }
}