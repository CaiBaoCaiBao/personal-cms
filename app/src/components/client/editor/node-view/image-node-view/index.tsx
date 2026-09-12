"use client";
import {
    NodeViewWrapper,
    type NodeViewProps,
    useEditorState,
} from "@tiptap/react";
import { FileUpload } from "@/components/client/file-upload";
import { useFileUpload } from "@/hooks/use-file-upload";
import { FileUploadOptions } from "@/type/file-upload.type";
import {
    HTTP,
    AppError,
    cn,
} from "@/lib/utils";
import type { ApiResult } from "@/type/api-result.type";
import { QINIU_UPLOAD_URL } from "@/constant/qiniu.constant";
import {
    UploadCloud,
} from "lucide-react";
import {
    useEffect,
    useRef,
    useState
} from "react";
import { ImageResizeHandles } from "./image-resize-handles";
import { ImagePanel } from "./image-panel";
import { ImageCaption } from "./caption";
import { useIsCoarsePointer } from "@/hooks/use-is-coarse-pointer";
import { NodeSelection } from "@tiptap/pm/state";

export type Align = "left" | "center" | "right";

type UploadToken = {
    token: string;
    key: string;
    url: string;
};

function assertApiOk<T>(res: unknown): T {
    if (res instanceof AppError) throw res;
    const result = res as ApiResult<T>;
    if (result && result.ok === true) return result.data;
    if (result && result.ok === false) {
        throw new AppError(result.error.code, result.error.message);
    }
    throw new AppError("INTERNAL_ERROR", "网络请求失败");
}

export function ImageNodeView({
    node,
    updateAttributes,
    editor,
    selected,
    deleteNode,
    getPos
}: NodeViewProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const figureRef = useRef<HTMLElement>(null);
    const [captionOpen, setCaptionOpen] = useState(false);
    const options: FileUploadOptions = {
        autoUpload: true,
        accept: "image/*",
        onUpload: async (file) => {
            const res = await HTTP.POST("/api/admin/v1/file", {
                params: { filename: file.name }
            });
            const { token, key, url } = assertApiOk<UploadToken>(res);
            const form = new FormData();
            form.append("token", token);
            form.append("key", key);
            form.append("file", file.rawFile);
            const uploadRes = await fetch(QINIU_UPLOAD_URL, {
                method: "POST",
                body: form,
            });
            if (!uploadRes.ok) throw new AppError("VALIDATION_ERROR", await uploadRes.text());
            return url;
        },
        onDelete: async (url) => {
            if (!url || url.startsWith("blob:")) return;
            const res = await HTTP.DELETE("/api/admin/v1/file", {
                params: { url },
            });
            assertApiOk<void>(res);
        },
        onUploaded: (file) => {
            if (!file.url || file.url.startsWith("blob:")) return;
            updateAttributes({ src: file.url });
        },
    }
    const [state, actions] = useFileUpload(options);
    const isCoarse = useIsCoarsePointer();

    const align = (node.attrs.align as Align) ?? "center";
    const caption = (node.attrs.caption as string) ?? "";
    const width = node.attrs.width as number | null;
    const editable = editor.isEditable;
    const isFocused = useEditorState({
        editor,
        selector: ({ editor }) => editor.isFocused,
    });
    const showPanel = selected && editable && (isFocused || isCoarse);

    useEffect(() => {
        const el = figureRef.current;
        if (!el) return;
        const onTouchStart = (e: TouchEvent) => {
            if (!editor.isEditable) return;
            const target = e.target as HTMLElement | null;
            if (target?.closest("[data-image-panel], [data-resize-handle], [data-image-caption]")) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            const pos = getPos();
            if (typeof pos !== "number") return;
            const { view } = editor;
            view.dispatch(
                view.state.tr.setSelection(
                    NodeSelection.create(view.state.doc, pos),
                ),
            );
            view.dom.blur(); // 真正不弹 / 收起键盘
        };
        el.addEventListener("touchstart", onTouchStart, { passive: false });
        return () => el.removeEventListener("touchstart", onTouchStart);
    }, [editor, getPos]);

    if (!node.attrs.src) {
        if (!editable) return null;
        return (
            <NodeViewWrapper>
                <FileUpload
                    enableDrop={true}
                    className="cursor-pointer border border-dashed border-gray-300 rounded-md"
                    openFileDialog={actions.openFileDialog}
                    getInputProps={actions.getInputProps}
                    onDragEnter={actions.handleDragEnter}
                    onDragLeave={actions.handleDragLeave}
                    onDragOver={actions.handleDragOver}
                    onDrop={actions.handleDrop}

                >
                    <div className="flex items-center justify-center text-gray-500 p-28 gap-4">
                        <UploadCloud className="w-10 h-10" />
                        <p className="text-center text-lg">Click or drag and drop to upload</p>
                    </div>
                </FileUpload>
            </NodeViewWrapper>
        )
    }

    return (
        <NodeViewWrapper
            data-align={align}
            className={cn(
                "flex w-full",
                align === "left" && "justify-start",
                align === "center" && "justify-center",
                align === "right" && "justify-end",
            )}
        >
            <figure
                ref={figureRef}
                className="mt-0"
            >
                <div className="relative inline-block">
                    <img
                        ref={imgRef}
                        draggable={false}
                        src={node.attrs.src}
                        alt={node.attrs.alt}
                        style={{
                            width: width ? `${width}px` : undefined,
                            height: "auto",
                            maxWidth: '100%',
                        }}
                        className={cn("mt-0", editable && "cursor-pointer")}
                    />
                    {showPanel && (
                        <ImageResizeHandles
                            imgRef={imgRef}
                            width={width}
                            onCommit={(w) => updateAttributes({ width: w, height: null })}
                        />
                    )}
                    {showPanel && (
                        <ImagePanel
                            align={align}
                            hasCaption={Boolean(caption.trim())}
                            captionOpen={captionOpen}
                            setAlign={(align) => updateAttributes({ align })}
                            deleteNode={() => {
                                const src = node.attrs.src as string | undefined;
                                deleteNode();
                                if (src && !src.startsWith("blob:")) {
                                    void HTTP.DELETE("/api/admin/v1/file", {
                                        params: { url: src },
                                    });
                                }
                            }}
                            onCaptionOpen={() => setCaptionOpen(true)}
                        />
                    )}
                </div>
                <ImageCaption
                    editable={editable}
                    captionOpen={captionOpen}
                    caption={caption}
                    setCaption={(value) => updateAttributes({ caption: value })}
                    onEdit={() => setCaptionOpen(true)}
                    onClose={() => setCaptionOpen(false)}
                />
            </figure>
        </NodeViewWrapper>
    )
}