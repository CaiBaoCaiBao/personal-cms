import { MEDIA_FILE_MUTATION_KEY, MEDIA_FILE_QUERY_KEY } from "@/constant/media.constant";
import { mutationOptions } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback;
}

export class MediaMutation {
    static upload() {
        return mutationOptions({
            mutationKey: MEDIA_FILE_MUTATION_KEY.create(),
            mutationFn: async () => {
                // 上传占位
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
                // 文件移除占位
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