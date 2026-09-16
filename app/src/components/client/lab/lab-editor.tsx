"use client";
import '@mdxeditor/editor/style.css';
import { ForwardRefEditor } from '../editor';
import { FixedToolbar } from '../editor/toolbar/fixed-toolbar';
import {
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    DiffSourceToggleWrapper,
    diffSourcePlugin,
    InsertTable,
    CodeToggle,
    InsertThematicBreak,
    ListsToggle,
} from '@mdxeditor/editor';
export function LabEditorPage() {
    return (
        <div>
            <ForwardRefEditor
                markdown={""}
                plugins={[
                    diffSourcePlugin({ diffMarkdown: 'An older version', viewMode: 'rich-text' }),
                    toolbarPlugin({
                        toolbarClassName: "toolbar flex items-center",
                        toolbarContents: () => <FixedToolbar />
                    })
                ]}
            />
        </div>
    )
}