import { Extensions } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { ImageExtension } from "./image.extensions";
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';

type ExtensionType = {
    placeholder?: string;
}

export const getExtensions = (config: ExtensionType): Extensions => {
    return [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3],
            },
            link: {
                openOnClick: false,
                autolink: true,
                markdownLinks: true,
                defaultProtocol: 'https',
                protocols: ['http', 'https'],
            },
        }),
        Placeholder.configure({
            placeholder: config.placeholder || "Write something …",
        }),
        ImageExtension.configure({
            allowBase64: true,
            resize: {
                enabled: true,
                directions: ["top", "bottom", "left", "right"],
                minWidth: 50,
                minHeight: 50,
                alwaysPreserveAspectRatio: true,
            }
        }),
        Subscript.extend({
            excludes: "subscript superscript",
        }),
        Superscript.extend({
            excludes: "superscript subscript",
        }),
    ]
}