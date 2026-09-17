"use client";
import '@mdxeditor/editor/style.css';
import { ForwardRefEditor } from '../editor';
import { FixedToolbar } from '../editor/toolbar/fixed-toolbar';
import {
    toolbarPlugin,
    diffSourcePlugin,
} from '@mdxeditor/editor';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
export function LabEditorPage() {
    const [markdown, setMarkdown] = useState("");
    return (
        <div className='h-screen'>
            <ForwardRefEditor
                markdown={markdown}
                onChange={(value) => setMarkdown(value)}
                plugins={[
                    diffSourcePlugin({
                        diffMarkdown: 'An older version',
                        viewMode: 'rich-text',
                        readOnlyDiff: true,
                    }),
                    toolbarPlugin({
                        toolbarClassName: "toolbar flex items-center",
                        toolbarContents: () => <FixedToolbar />
                    })
                ]}
            />
            <Button onClick={() => console.log(markdown)}>
                Save
            </Button>
        </div>
    )
}