import { InputHTMLAttributes, DragEvent } from "react";

type UploadState = "idle" | "uploading" | "done" | "error";
type CompressState = "idle" | "compressing" | "done" | "error";

export type FileMetadata = {
    rawFile: File;
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    compressState: CompressState;
}

export type FileWithPreview = FileMetadata & {
    status?: UploadState;
    progress?: number;
    error?: string;
    compressState?: CompressState;
}

export type FileUploadOptions = {
    initialFiles?: FileMetadata[];
    maxFiles?: number;
    fileSize?: number;
    multiple?: boolean;
    autoUpload?: boolean;
    accept?: string;
    compress?: boolean;
    onError?: (error: string[]) => void;
    onFilesChange?: (files: FileWithPreview[]) => void;
    onFilesAdd?: (files: FileWithPreview[]) => void;
    onDelete?: (url: string) => Promise<void>;
    onUpload?: (
        file: FileMetadata,
        onProgress: (progress: number) => void
    ) => Promise<string | null>;
    onUploaded?: (file: FileWithPreview) => void;
}

export type FileUploadState = {
    files: FileWithPreview[];
    isDragging: boolean;
    error: string[];
    batchIds: string[];
}

export type FileUploadActions = {
    getInputProps:
    (props: InputHTMLAttributes<HTMLInputElement>) =>
        InputHTMLAttributes<HTMLInputElement>;
    openFileDialog: () => void;
    addFiles: (files: FileList | File[]) => void;
    clearFiles: () => void;
    removeFile: (id: string) => void;
    uploadFileById: (id: string) => Promise<string | null>;
    updateFileById: (id: string, data: Partial<FileWithPreview>) => void;
    handleDragEnter: (e: DragEvent<HTMLElement>) => void;
    handleDragLeave: (e: DragEvent<HTMLElement>) => void;
    handleDragOver: (e: DragEvent<HTMLElement>) => void;
    handleDrop: (e: DragEvent<HTMLElement>) => void;
}