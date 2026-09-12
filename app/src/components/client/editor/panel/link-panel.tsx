"use client";

import {
    useEffect,
    useId,
    useState
} from "react";
import type { Editor } from "@tiptap/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldLabel
} from "@/components/ui/field";
import { ResponsiveDialogDrawer } from "@/components/client/responsive-dialog-drawer";
import { getMarkRange } from "@tiptap/react";


interface Props {
    editor: Editor;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LinkPanel({ editor, open, onOpenChange }: Props) {
    const formId = `link-panel-${useId()}`;
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [selection, setSelection] = useState({ from: 0, to: 0 });
    const active = editor.isActive("link");

    useEffect(() => {
        if (!open) return;
        const { from, to, $from } = editor.state.selection;
        const markRange = editor.isActive("link")
            ? editor.view.state.schema.marks.link &&
            // 用 getMarkRange 扩到完整链接，避免只拿到光标位置
            getMarkRange($from, editor.schema.marks.link)
            : null;
        const range = markRange ?? { from, to };
        setUrl(editor.getAttributes("link").href ?? "");
        setText(editor.state.doc.textBetween(range.from, range.to));
        setSelection({ from: range.from, to: range.to });
    }, [open, editor]);

    function restore() {
        return editor.chain().focus().setTextSelection(selection);
    }

    function close() {
        onOpenChange(false);
    }

    function apply() {
        const href = url.trim();
        const label = text.trim();
        const chain = restore();

        if (!href) {
            chain.extendMarkRange("link").unsetLink().run();
            close();
            return;
        }

        const isCollapsed = selection.from === selection.to;
        const display = label || (isCollapsed ? href : undefined);

        if (display) {
            // 有自定义文字，或折叠选区需要插入新文本
            chain
                .insertContentAt(
                    { from: selection.from, to: selection.to },
                    {
                        type: "text",
                        text: display,
                        marks: [{ type: "link", attrs: { href } }],
                    },
                )
                .run();
        } else {
            // 已有选区文字，只改 URL
            chain.extendMarkRange("link").setLink({ href }).run();
        }
        close();
    }

    return (
        <ResponsiveDialogDrawer
            open={open}
            onOpenChange={onOpenChange}
            title="Link"
            footer={
                <>
                    {active && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                restore().extendMarkRange("link").unsetLink().run();
                                close();
                            }}
                        >
                            Unlink
                        </Button>
                    )}
                    <Button type="submit" form={formId}>
                        Apply
                    </Button>
                </>
            }
        >
            <form
                id={formId}
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    apply();
                }}
            >
                <Field>
                    <FieldLabel htmlFor={`${formId}-text`}>Text (optional)</FieldLabel>
                    <Input
                        id={`${formId}-text`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text for the link"
                        autoComplete="off"
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${formId}-url`}>URL</FieldLabel>
                    <Input
                        id={`${formId}-url`}
                        autoFocus
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        autoComplete="off"
                    />
                </Field>
            </form>
        </ResponsiveDialogDrawer>
    );
}