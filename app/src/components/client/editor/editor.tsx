"use client";

import {
    useEditor,
    Tiptap,
    JSONContent,
} from "@tiptap/react";
import { getExtensions } from "./extensions";
import { cn } from "@/lib/utils";
import "./editor.css";
import {useEffect} from "react";

export const defaultContent = "<p></p>";

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
    className = "",
    children,
    onBlur,
    onUpdate,
    editable = true,
}: Props) {
    const editor = useEditor({
        extensions: getExtensions({placeholder:"Write something..."}),
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
        const next = content ?? defaultContent;
        if (editor.getHTML() === next) return;
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