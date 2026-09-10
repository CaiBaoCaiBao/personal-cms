import { formatBytes } from "@/lib/utils";
import {
    FileUploadOptions,
    FileUploadState,
    FileUploadActions,
    FileWithPreview,
    FileMetadata,
} from "@/type/file-upload.type";
import {
    useState,
    useRef,
    useCallback,
    InputHTMLAttributes,
    DragEvent
} from "react";
import { isAppError } from "@/lib/utils";
import { compressImage } from "@/lib/utils";

function generateUniqueId(file: File | { id: string }) {
    if (!(file instanceof File)) return file.id;

    if (typeof globalThis.crypto?.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }

    // HTTP / 旧浏览器 fallback
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function toFileMetadata(file: FileMetadata): FileWithPreview {
    return {
        rawFile: file.rawFile,
        id: file.name,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        status: "done",
        compressState: file.compressState ?? "idle"
    }
}

function validateFile(file: File, fileSize: number, accept: string) {
    if (file.size > fileSize) {
        return `File "${file.name}" exceeds the maximum size of ${formatBytes(fileSize)}.`;
    }
    if (accept !== "*") {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const fileType = file.type;
        const fileExtension = `.${file.name.split(".").pop()}`;
        const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
                return fileExtension.toLowerCase() === type.toLowerCase();
            }
            if (type.endsWith("/*")) {
                return fileType.startsWith(`${type.split("/")[0]}/`);
            }
            return fileType === type;
        })
        if (!isAccepted) {
            return `File "${file.name}" is not an accepted file type.`;
        }
    }
    return null;
}

export function useFileUpload(
    options: FileUploadOptions = {}
): [FileUploadState, FileUploadActions] {

    const {
        initialFiles = [],
        maxFiles = Number.POSITIVE_INFINITY,
        fileSize = Number.POSITIVE_INFINITY,
        accept = "*",
        multiple = false,
        autoUpload = false,
        compress = true,
        onError,
        onFilesChange,
        onFilesAdd,
        onDelete,
        onUpload,
        onUploaded,
    } = options;

    const [state, setState] = useState<FileUploadState>({
        files: initialFiles.map(toFileMetadata),
        isDragging: false,
        error: [],
        batchIds: [],
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const filesRef = useRef<FileWithPreview[]>(state.files);
    const onErrorRef = useRef(onError);
    const onFilesChangeRef = useRef(onFilesChange);
    const onFilesAddRef = useRef(onFilesAdd);
    const onDeleteFnRef = useRef(onDelete);
    const onUploadFnRef = useRef(onUpload);
    const onUploadedRef = useRef(onUploaded);

    onErrorRef.current = onError;
    onFilesChangeRef.current = onFilesChange;
    onFilesAddRef.current = onFilesAdd;
    onDeleteFnRef.current = onDelete;
    onUploadFnRef.current = onUpload;
    onUploadedRef.current = onUploaded;

    const clearInput = () => {
        if (inputRef.current) inputRef.current.value = "";
    }

    const commitFiles = useCallback((
        next: FileWithPreview[],
        error?: string[],
        batchIds?: string[],
    ) => {
        filesRef.current = next;
        setState((prev) => ({
            ...prev,
            files: next,
            ...(error !== undefined ? { error } : {}),
            ...(batchIds !== undefined ? { batchIds } : {}),
        }));
        onFilesChangeRef.current?.(next);
        if (error !== undefined) {
            onErrorRef.current?.(error);
        }
    }, [])

    /** @description 修改文件状态 */
    const patchFile = useCallback((
        id: string, patch: Partial<FileWithPreview>
    ) => {
        const next = filesRef.current.map((f) =>
            f.id === id ? { ...f, ...patch } : f,
        );
        commitFiles(next);
        return next.find((f) => f.id === id) ?? null;
    }, [commitFiles]);

    const addFiles = useCallback(async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;

        const fileArray = multiple ? Array.from(files) : Array.from(files).slice(0, 1);
        const prevFiles = filesRef.current;
        const errors: string[] = [];

        if (multiple &&
            maxFiles !== Number.POSITIVE_INFINITY &&
            prevFiles.length + fileArray.length > maxFiles
        ) {
            const maxFilesError = [`You can only upload a maximum of ${maxFiles} files`];
            commitFiles(prevFiles, maxFilesError);
            clearInput();
            return;
        }

        const validFiles: FileWithPreview[] = [];

        for (let file of fileArray) {
            if (multiple) {
                const isDuplicate =
                    prevFiles.some(f => f.name === file.name && f.size === file.size) ||
                    validFiles.some(f => f.name === file.name && f.size === file.size);
                if (isDuplicate) continue;
            }

            const error = validateFile(file, fileSize, accept);
            if (error) {
                errors.push(error);
                continue;
            }
            const id = generateUniqueId(file);
            const previewUrl = URL.createObjectURL(file);
            if (compress && file.type.startsWith("image/")) {
                // console.log("before compress", file);
                const entry: FileWithPreview = {
                    rawFile: file,
                    id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    status: "idle",
                    url: previewUrl,
                    compressState: "compressing",
                };
                validFiles.push(entry);
                commitFiles(
                    multiple ? [...prevFiles, ...validFiles] : validFiles,
                    errors,
                );
            
                const compressError = await compressEntry(entry);
                if (compressError) errors.push(compressError);
                continue;
            }
            validFiles.push({
                rawFile: file,
                id: id,
                name: file.name,
                type: file.type,
                size: file.size,
                status: "idle",
                url: previewUrl,
                compressState: "idle",
            });
        }
        if (validFiles.length === 0) {
            commitFiles(prevFiles, errors);
            clearInput();
            return;
        }

        if (!multiple && prevFiles.length > 0) {
            const toDelete = prevFiles.filter(f => f.status === "done" && f.url);
            if (toDelete.length > 0) {
                const deleteFn = onDeleteFnRef.current;
                if (!deleteFn) {
                    const missDeleteFnError = ["deleteFn is not provide"]
                    commitFiles(validFiles, missDeleteFnError);
                    clearInput();
                    return;
                }
                toDelete.forEach((f) => void deleteFn(f.url!));
            }
        }

        const next = multiple ? [...prevFiles, ...validFiles] : validFiles;
        const batchIds = validFiles.map(f => f.id);
        commitFiles(next, errors, batchIds);
        onFilesAddRef.current?.(validFiles);
        if (autoUpload) {
            void Promise.all(validFiles.map((f) => uploadFileById(f.id)));
        } else {
            void Promise.all(validFiles.map((f) => onUploadedRef.current?.(f)));
        }
        clearInput();
    }, [multiple, maxFiles, fileSize, accept, commitFiles]);

    const clearFiles = useCallback(async () => {
        const prev = [...filesRef.current];
        try {
            const deleteFn = onDeleteFnRef.current;
            if (!deleteFn) {
                const missDeleteFnError = ["deleteFn is not provide"]
                commitFiles(prev, missDeleteFnError);
                return;
            }
            await Promise.all(
                prev
                    .filter((f): f is typeof f & { url: string } => Boolean(f.url))
                    .map((f) => deleteFn(f.url)),
            );
        } catch (e) {
            const msg = isAppError(e) ? e.message : "Delete OSS failed";
            onErrorRef.current?.([msg]);
            return;
        }
        clearInput();
        commitFiles([]);
    }, [])

    const uploadFileById = useCallback(async (id: string): Promise<string | null> => {
        const current = filesRef.current.find((f) => f.id === id);
        if (!current) return null;
        if (current.compressState === "error") return null;
        if (current.status === "done" && current.url) return current.url;
        if (!onUploadFnRef.current) {
            const msg = "onUploadFn function is not provided";
            patchFile(id, { status: "error", error: msg });
            onErrorRef.current?.([msg]);
            return null;
        }
        patchFile(id, { status: "uploading", progress: 0, error: undefined });
        try {
            const url = await onUploadFnRef.current(current, (percent) => {
                patchFile(id, { progress: percent });
            });
            if (!url || url.startsWith("blob:")) {
                const msg = `File "${current.name}" is not a valid url`;
                patchFile(id, { status: "error", error: msg });
                onErrorRef.current?.([msg]);
                return null;
            }
            if (current.url.startsWith("blob:")) {
                URL.revokeObjectURL(current.url);
            }
            const next = patchFile(id, {
                status: "done",
                url,
                progress: 100
            });
            if (next) onUploadedRef.current?.(next);
            return url;
        } catch (e) {
            const msg = isAppError(e) ? e.message : "Upload file failed";
            onErrorRef.current?.([msg]);
            patchFile(id, { status: "error", error: msg });
            return null;
        }
    }, [])

    const updateFileById = useCallback((id: string, data: Partial<FileWithPreview>) => {
        patchFile(id, data);
    }, [patchFile]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.length) addFiles(e.target.files);
        }, [addFiles]
    )

    const getInputProps = useCallback(
        (props: InputHTMLAttributes<HTMLInputElement>) => ({
            ...props,
            type: "file" as const,
            onChange: handleFileChange,
            accept: props.accept || accept,
            multiple: props.multiple || multiple,
            ref: inputRef,
        }), [accept, multiple, handleFileChange]
    )

    const openFileDialog = useCallback(() => {
        inputRef.current?.click();
    }, [])

    const removeFile = useCallback(async (id: string) => {
        const current = filesRef.current.find((f) => f.id === id);
        if (!current) return;
        if (onDeleteFnRef.current) {
            await onDeleteFnRef.current(current.url);
        }
        if (current.url.startsWith("blob:")) URL.revokeObjectURL(current.url);
        const next = filesRef.current.filter((f) => f.id !== id);
        commitFiles(next);
    }, [commitFiles]);

    const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setState((prev) => ({ ...prev, isDragging: true }));
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setState((prev) => ({ ...prev, isDragging: false }));
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent<HTMLElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setState((prev) => ({ ...prev, isDragging: false }));
            if (inputRef.current?.disabled) return;
            if (!e.dataTransfer.files?.length) return;
            if (!multiple) addFiles([e.dataTransfer.files[0]]);
            else addFiles(e.dataTransfer.files);
        },
        [addFiles, multiple],
    );

    const compressEntry = useCallback(async (entry: FileWithPreview) => {
        try {
            const compressedFile = await compressImage({ file: entry.rawFile });
            URL.revokeObjectURL(entry.url);
            const newUrl = URL.createObjectURL(compressedFile);
            const patch = {
                rawFile: compressedFile,
                size: compressedFile.size,
                url: newUrl,
                compressState: "done" as const,
            };
            Object.assign(entry, patch);
            patchFile(entry.id, patch);
            return null; // 无错误
        } catch {
            const compressError = `Failed to compress image "${entry.name}"`;
            const patch = {
                compressState: "error" as const,
                error: compressError,
            };
            Object.assign(entry, patch);
            patchFile(entry.id, patch);
            return compressError;
        }
    }, [patchFile]);

    return [state, {
        getInputProps,
        openFileDialog,
        addFiles,
        clearFiles,
        removeFile,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        uploadFileById,
        updateFileById,
    }];
}