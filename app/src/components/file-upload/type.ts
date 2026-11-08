export type UploadState = "idle" | "uploading" | "success" | "error";

export type FileMetadata = {
    id: string;
    file: File;
    url: string;
    status: UploadState;
    error?: string;
};
