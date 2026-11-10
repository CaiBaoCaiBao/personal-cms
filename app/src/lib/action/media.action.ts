"use server";
import { actionHandler } from "../handler";
import { MediaFileService } from "@/lib/service/media-file.service";
import {
    mediaFileQuerySchema,
    mediaFileSchema,
    UploadTokenDTO
} from "../schema/media/media-file.schema";
import { paginationSchema } from "../schema/globals.schema";

export const getUploadToken = actionHandler<UploadTokenDTO, string>({
    module: "MEDIA_FILE",
    handler: async (input) => {
        const token = await MediaFileService.generateUploadToken(
            input.key,
            input.hash,
            input.expire
        );
        return { ok: true, data: token };
    }
})

export const createMediaFile = actionHandler({
    module: "MEDIA_FILE",
    schema: mediaFileSchema,
    handler: async (input) => {
        return { ok: true };
    }
})

export const removeMediaFile = actionHandler({
    module: "MEDIA_FILE",
    handler: async (id: string) => {
        
        return { ok: true };
    }
})

export const getMediaPagination = actionHandler({
    module: "MEDIA_FILE",
    schema: mediaFileQuerySchema.extend(paginationSchema.shape),
    handler: async (input) => {
        const { pageIndex, pageSize, ...query } = input;
    
        return { ok: true };
    }
})

export const getMediaCategories = actionHandler<void, string[]>({
    module: "MEDIA_FILE",
    handler: async () => {
        return { ok: true };
    }
})