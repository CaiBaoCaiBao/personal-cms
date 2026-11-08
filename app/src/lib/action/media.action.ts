"use server";
import { actionHandler } from "../handler";
import { MediaFileService } from "@/lib/service/media-file.service";
import {
    mediaFileSchema,
    UploadTokenDTO
} from "../schema/media/media-file.schema";

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
        await MediaFileService.create(input);
        return { ok: true };
    }
})