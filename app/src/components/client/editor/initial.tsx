"use client";
import {
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    tablePlugin,
    linkDialogPlugin,
    linkPlugin,
    type MDXEditorMethods,
    type MDXEditorProps
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import type { ForwardedRef } from 'react';

interface Props extends MDXEditorProps {
    editorRef: ForwardedRef<MDXEditorMethods> | null;
    canEdit?: boolean;
}

export function InitializedMDXEditor({ editorRef, canEdit = false, ...props }: Props) {
    return (
        <MDXEditor
            {...props}
            contentEditableClassName='h-full border border-red-500'
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                tablePlugin(),
                linkDialogPlugin(),
                linkPlugin(),
                ...(props.plugins ?? []),
            ]}
            ref={editorRef}
        />
    )
}