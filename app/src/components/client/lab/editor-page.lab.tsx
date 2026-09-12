"use client";

import { Editor } from "@/components/client/editor/editor";
import { FixedMenuBar } from "@/components/client/editor/menu-bar/fixed-menu-bar";

export function EditorPageLab() {
    return (
        <Editor
            className="min-h-112 rounded-xl border bg-card px-3 py-3"
            placeholder="写点什么..."
        >
            <Editor.Toolbar className="border-b pb-2">
                <FixedMenuBar />
            </Editor.Toolbar>
            <Editor.Content />
        </Editor>
    );
}
