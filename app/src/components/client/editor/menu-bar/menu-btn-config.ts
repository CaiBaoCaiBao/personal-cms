import {
    BoldIcon,
    LucideIcon,
    Undo2,
    Link,
    ImagePlus,
    Code,
    Italic,
    Strikethrough,
    Superscript,
    Subscript,
    Redo2,
    Heading,
    Heading1,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { LinkPanel } from "../panel/link-panel";
import { MenuBarConfig } from "@/type/editor.type";

export const menuBarConfig: MenuBarConfig[] = [
    {
        group: "history",
        children: [
            {
                id: "undo",
                label: "Undo",
                icon: Undo2,
                action: (editor: Editor) => editor.chain().focus().undo().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().undo().run(),
                isActive: (_: Editor) => false,
            },
            {
                id: "redo",
                label: "Redo",
                icon: Redo2,
                action: (editor: Editor) => editor.chain().focus().redo().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().redo().run(),
                isActive: (_: Editor) => false,
            },
        ]
    },
    {
        group: "inline",
        children: [
            {
                id: "bold",
                label: "Bold",
                icon: BoldIcon,
                action: (editor: Editor) => editor.chain().focus().toggleBold().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().toggleBold().run(),
                isActive: (editor: Editor) => editor.isActive("bold"),
            },
            {
                id: "italic",
                label: "Italic",
                icon: Italic,
                action: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().toggleItalic().run(),
                isActive: (editor: Editor) => editor.isActive("italic"),
            },
            {
                id: "strike",
                label: "Strike",
                icon: Strikethrough,
                action: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().toggleStrike().run(),
                isActive: (editor: Editor) => editor.isActive("strike"),
            },
            {
                id: "superscript",
                label: "Superscript",
                icon: Superscript,
                action: (editor: Editor) => editor.chain().focus().toggleSuperscript().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().toggleSuperscript().run(),
                isActive: (editor: Editor) => editor.isActive("superscript"),
            },
            {
                id: "subscript",
                label: "Subscript",
                icon: Subscript,
                action: (editor: Editor) => editor.chain().focus().toggleSubscript().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().toggleSubscript().run(),
                isActive: (editor: Editor) => editor.isActive("subscript"),
            },
            {
                id: "code",
                label: "Code",
                icon: Code,
                action: (editor: Editor) => editor.chain().focus().toggleCode().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().toggleCode().run(),
                isActive: (editor: Editor) => editor.isActive("code"),
            }
        ]
    },
    {
        group: "blocks",
        children: [
            {
                id: "heading",
                label: "Heading",
                icon: Heading,
                items: [
                    {
                        id: "heading-1",
                        label: "Heading 1",
                        icon: Heading1,
                        action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                        disabled: (editor: Editor) => !editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
                        isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
                    }
                ]
            },
            
        ]
    },
    {
        group: "media",
        children: [
            {
                id: "link",
                label: "Link",
                icon: Link,
                action: (editor: Editor) => editor.chain().focus().toggleLink().run(),
                disabled: (editor: Editor) => !editor.can().chain().focus().toggleLink().run(),
                isActive: (editor: Editor) => editor.isActive("link"),
                panel: LinkPanel,
            },
            {
                id: "image",
                label: "Add Image",
                icon: ImagePlus,
                action: (editor: Editor) => editor.chain().focus().insertContent({
                    type: "image",
                }).run(),
                disabled: (editor: Editor) => !editor.isEditable,
                isActive: (_: Editor) => false,
            }
        ]
    }
] as const;