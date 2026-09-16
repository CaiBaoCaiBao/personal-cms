"use client";
import {
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    tablePlugin,
    type MDXEditorMethods,
    type MDXEditorProps
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import type { ForwardedRef } from 'react'

interface Props extends MDXEditorProps {
    editorRef: ForwardedRef<MDXEditorMethods> | null;
    canEdit?: boolean;
}

export function InitializedMDXEditor({ editorRef, canEdit = false, ...props }: Props) {
    return (
        <MDXEditor
            {...props}
            plugins={[
                // Example Plugin Usage
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                tablePlugin(),
                ...(props.plugins ?? []),
            ]}
            ref={editorRef}
        />
    )
}