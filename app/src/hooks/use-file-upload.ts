import {
    FileMetadata,
    UploadState
} from "@/components/file-upload/type";
import {
    useState,
    useRef,
    useCallback,
    InputHTMLAttributes,
    Ref,
    ChangeEvent,
    DragEvent,
    useEffect,
} from "react";
import {
    formatBytes,
    generateUUID,
    stopEventBubble
} from "@/lib/utils";
import { toast } from "@/components/ui/toast"

type FileUploadState = {
    files: FileMetadata[];
    errors?: string[];
    isDragging: boolean;
}

type FileUploadAction = {
    getInputProps: (props: InputHTMLAttributes<HTMLInputElement>) =>
        InputHTMLAttributes<HTMLInputElement> & {
            ref: Ref<HTMLInputElement>
        }
    handleOpenDialog: () => void;
    handleFilesAdded: (files: FileMetadata[]) => void;
    removeFile: (id: string) => void;
    clearFiles: () => void;
    clearErrors: () => void;
    handleDragOver: (e: DragEvent<HTMLElement>) => void;
    handleDragLeave: (e: DragEvent<HTMLElement>) => void;
    handleDragEnter: (e: DragEvent<HTMLElement>) => void;
    handleDrop: (e: DragEvent<HTMLElement>) => void;
    patchFile: (id: string, patch: { status: UploadState; url?: string; error?: string }) => void;
}

export type FileUploadOptions = {
    initialFiles?: FileMetadata[];
    multiple?: boolean;
    accept?: string;
    maxFiles?: number;
    maxSize?: number;
    auto?: boolean;
    onError?: (errors: string[]) => void;
    onFilesAdded?: (files: FileMetadata[]) => void;
    onFilesChanged?: (files: FileMetadata[]) => void;
    onRemoveFile?: (id: string) => void;
}

export function useFileUpload(
    options: FileUploadOptions = {}
): [FileUploadState, FileUploadAction] {
    const {
        initialFiles = [],
        multiple = true,
        accept = "*",
        maxFiles = Number.POSITIVE_INFINITY,
        maxSize = Number.POSITIVE_INFINITY,
        auto = true,
        onError,
        onFilesAdded,
        onFilesChanged,
        onRemoveFile
    } = options;

    const [state, setState] = useState<FileUploadState>({
        files: initialFiles,
        isDragging: false,
        errors: [],
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const filesRef = useRef(state.files);
    const errorsRef = useRef(onError);
    const filesAddedRef = useRef(onFilesAdded);
    const filesChangedRef = useRef(onFilesChanged);
    const removeFileRef = useRef(onRemoveFile);

    useEffect(() => {
        filesRef.current = state.files;
        errorsRef.current = onError;
        filesAddedRef.current = onFilesAdded;
        filesChangedRef.current = onFilesChanged;
        removeFileRef.current = onRemoveFile;
    });

    const generateFileId = useCallback((file: File | FileMetadata) => {
        if (file instanceof File) return generateUUID();
        return file.id;
    }, [])

    const generateFilePreview = useCallback((file: File | FileMetadata) => {
        if (file instanceof File) return URL.createObjectURL(file);
        return file.url;
    }, [])

    const patchFile = useCallback((id: string, patch: { status: UploadState; url?: string; error?: string }) => {
        setState((prev) => ({
            ...prev,
            files: prev.files.map((file) => {
                if (file.id !== id) return file;
                if (patch.url && file.url.startsWith("blob:") && patch.url !== file.url) {
                    URL.revokeObjectURL(file.url);
                }
                return {
                    ...file,
                    status: patch.status,
                    ...(patch.url !== undefined ? { url: patch.url } : {}),
                    error: patch.status === "error" ? patch.error : undefined,
                };
            }),
        }))
    }, []);

    const clearFiles = useCallback(() => {
        for (const file of state.files) {
            if (file.url.startsWith("blob:")) {
                URL.revokeObjectURL(file.url);
            }
        }
        setState((prev) => ({
            ...prev,
            files: [],
            errors: [],
        }))
    }, [state.files])

    const validateFile = useCallback((file: File | FileMetadata): string | null => {
        if (file instanceof File) {
            if (file.size > maxSize) {
                return `文件 ${file.name} 超过 ${formatBytes(maxSize)} 大小限制`;
            }
        } else {
            if (file.file.size > maxSize) {
                return `文件 ${file.file.name} 超过 ${formatBytes(maxSize)} 大小限制`;
            }
        }
        if (accept !== "*") {
            const acceptedTypes = accept.split(",").map((type) => type.trim());
            const fileType = file instanceof File ? file.type || "" : file.file.type;
            const fileExtension = `.${file instanceof File ? file.name.split(".").pop() : file.file.name.split(".").pop()}`;

            const isAccepted = acceptedTypes.some((type) => {
                if (type.startsWith(".")) {
                    return fileExtension.toLowerCase() === type.toLowerCase()
                }
                if (type.endsWith("/*")) {
                    const baseType = type.split("/")[0]
                    return fileType.startsWith(`${baseType}/`)
                }
                return fileType === type
            })

            if (!isAccepted) {
                return `文件 "${file instanceof File ? file.name : file.file.name}" 不是接受的文件类型.`
            }
        }
        return null;
    }, [accept, maxSize])

    const addFiles = useCallback((newFiles: File[] | FileList) => {
        if (newFiles.length === 0) return;

        if (!multiple) {
            clearFiles()
        }
        const newFilesArray = Array.from(newFiles);
        const errors: string[] = [];

        const existingFiles = filesRef.current;
        if (multiple &&
            maxFiles !== Number.POSITIVE_INFINITY &&
            existingFiles.length + newFilesArray.length > maxFiles
        ) {
            errors.push(`最多可上传${maxFiles}个文件`);
            errorsRef.current?.(errors);
            setState((prev) => ({ ...prev, errors }));
            return;
        }

        const validFiles: FileMetadata[] = [];
        for (const file of newFilesArray) {
            if (multiple) {
                const isDuplicate = [...existingFiles, ...validFiles].some((existing) =>
                    existing.file.name === file.name &&
                    existing.file.size === file.size
                );
                if (isDuplicate) continue;

                if (file.size > maxSize) {
                    errors.push(multiple ?
                        `文件队列存在超过${formatBytes(maxSize)}大小限制的文件` :
                        `文件超过${formatBytes(maxSize)}大小限制`
                    );
                    errorsRef.current?.(errors);
                    setState((prev) => ({ ...prev, errors }));
                    return;
                }
            }
            const error = validateFile(file);
            if (error) {
                errors.push(error);
            } else {
                validFiles.push({
                    id: generateFileId(file),
                    file,
                    url: generateFilePreview(file),
                    status: "idle"
                })
            }
        }
        if (validFiles.length > 0) {
            let newFiles: FileMetadata[] = [];
            if (auto) {
                if (!filesAddedRef.current) {
                    toast.add({
                        title: "文件无法远程上传",
                        description: "filesAddedFn is undefined",
                        type: "warning"
                    })
                }
                filesAddedRef.current?.(validFiles);
            }
            setState((prev) => {
                newFiles = multiple ? [...prev.files, ...validFiles] : [...validFiles];
                return {
                    ...prev,
                    files: newFiles,
                    errors
                }
            })
            if (newFiles && newFiles.length > 0) filesChangedRef.current?.(newFiles);
        } else if (errors.length > 0) {
            errorsRef.current?.(errors);
            setState((prev) => ({ ...prev, errors }));
        }
        if (inputRef.current) inputRef.current.value = "";
    }, [
        multiple,
        auto,
        maxSize,
        maxFiles,
        clearFiles,
        validateFile,
        generateFileId,
        generateFilePreview,
    ])

    const handleFilesAdded = useCallback((files: FileMetadata[]) => {
        if (!files || files.length === 0) return;
        if (auto) {
            toast.add({
                title: "文件上传模式不兼容",
                description: "Upload mode is auto,but the action is manual",
                type: "warning"
            })
            return;
        }
        if (!filesAddedRef.current) {
            toast.add({
                title: "文件远程上传失败",
                description: "filesAddedFn is undefined",
                type: "warning"
            })
            return;
        }
        filesAddedRef.current(files);
    }, [auto])


    const removeFile = useCallback((id: string) => {
        const toRemove = filesRef.current.find((file) => file.id === id);
        if (!toRemove) return;
        if (toRemove.url.startsWith("blob:")) {
            URL.revokeObjectURL(toRemove.url);
        }
        setState((prev) => ({
            ...prev,
            files: prev.files.filter((file) => file.id !== id),
            errors: [],
        }));
        removeFileRef.current?.(id);
    }, []);

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(e.target.files);
        }
    }, [addFiles])

    const getInputProps = useCallback((props: InputHTMLAttributes<HTMLInputElement>) => {
        return {
            ...props,
            multiple: props.multiple === undefined ? multiple : props.multiple,
            accept: props.accept || accept,
            type: "file" as const,
            className: "hidden",
            onChange: handleFileChange,
            ref: inputRef,
        }
    }, [multiple, accept, handleFileChange])

    const handleOpenDialog = useCallback(() => {
        inputRef.current?.click();
    }, [])

    /** @description 清空错误信息 */
    const clearErrors = useCallback(() => {
        setState((prev) => ({ ...prev, errors: [] }));
        errorsRef.current?.([]);
    }, []);

    /** @description 处理拖拽事件 */
    const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
        stopEventBubble(e);
    }, []);

    /** @description 处理拖拽离开事件 */
    const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
        stopEventBubble(e);
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        setState((prev) => ({ ...prev, isDragging: false }));
    }, []);

    /** @description 处理拖拽进入事件 */
    const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
        stopEventBubble(e);
        setState((prev) => ({ ...prev, isDragging: true }));
    }, []);

    /** @description 处理拖拽放下事件 */
    const handleDrop = useCallback((e: DragEvent<HTMLElement>) => {
        stopEventBubble(e);
        setState((prev) => ({ ...prev, isDragging: false }));

        if (inputRef.current?.disabled) {
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (!multiple) {
                const file = e.dataTransfer.files[0];
                addFiles([file]);
            } else {
                addFiles(e.dataTransfer.files);
            }
        }
    }, [multiple, addFiles]);


    return [state, {
        getInputProps,
        handleOpenDialog,
        handleFilesAdded,
        removeFile,
        clearFiles,
        clearErrors,
        handleDragOver,
        handleDragLeave,
        handleDragEnter,
        handleDrop,
        patchFile,
    }]
}