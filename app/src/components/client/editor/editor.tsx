"use client";

import {
    useEditor,
    Tiptap,
    JSONContent,
    type Editor as TiptapEditor,
} from "@tiptap/react";
import { getExtensions } from "./extensions";
import { cn } from "@/lib/utils";
import "./editor.css";
import { useEffect } from "react";

export const defaultContent = "<p></p>";

function isSameContent(editor: TiptapEditor, content: string | JSONContent) {
    if (typeof content === "string") {
        return editor.getHTML() === content;
    }
    return JSON.stringify(editor.getJSON()) === JSON.stringify(content);
}

interface Props {
    content?: string | JSONContent;
    placeholder?: string;
    className?: string;
    children?: React.ReactNode;
    onBlur?: () => void;
    onUpdate?: (payload: { html: string; json: JSONContent }) => void;
    editable?: boolean;
}

export function EditorRoot({
    content = defaultContent,
    placeholder = "Write something...",
    className = "",
    children,
    onBlur,
    onUpdate,
    editable = true,
}: Props) {
    const editor = useEditor({
        extensions: getExtensions({ placeholder }),
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "tiptap typeset min-h-full focus:outline-none",
            },
        },
        onBlur,
        onUpdate: ({ editor }) => {
            onUpdate?.({
                html: editor.getHTML(),
                json: editor.getJSON(),
            });
        },
        editable,
    });

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(editable);
    }, [editor, editable]);

    useEffect(() => {
        if (!editor) return;
        const next = content ?? defaultContent;
        if (isSameContent(editor, next)) return;
        editor.commands.setContent(next, { emitUpdate: false });
    }, [editor, content]);

    if (!editor) return null;

    return (
        <div className={cn("relative flex min-h-full flex-col", className)}>
            <Tiptap editor={editor}>
                <div className="flex min-h-full flex-1 flex-col">{children}</div>
            </Tiptap>
        </div>
    );
}

function EditorToolbar(props: React.ComponentProps<"div">) {
    return <div className={cn("flex shrink-0 flex-wrap items-center gap-1", props.className)} {...props} />;
}

function EditorContent(props: React.ComponentProps<typeof Tiptap.Content>) {
    return <Tiptap.Content className={cn("mt-5 focus:outline-none", props.className)} {...props} />;
}

function EditorFooter(props: React.ComponentProps<"div">) {
    return <div {...props} />;
}

export const Editor = Object.assign(EditorRoot, {
    Toolbar: EditorToolbar,
    Content: EditorContent,
    Footer: EditorFooter,
});