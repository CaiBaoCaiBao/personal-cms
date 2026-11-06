import { FieldOutputTypes } from "@/prisma/contract";

type MediaFileOutput = FieldOutputTypes["public"]["MediaFile"];

export const mediaFileListFields = [
    "id",
    "originalName",
    "url",
    "mimeType",
    "size",
    "durationMs",
    "createdAt",
] as const satisfies readonly (keyof MediaFileOutput)[];

export const mediaFileDetailFields = [
    "id",
    "originalName",
    "url",
    "mimeType",
    "size",
    "durationMs",
    "createdAt",
] as const satisfies readonly (keyof MediaFileOutput)[];

export type MediaFileList = Pick<MediaFileOutput, typeof mediaFileListFields[number]>;
export type MediaFileDetail = Pick<MediaFileOutput, typeof mediaFileDetailFields[number]>;