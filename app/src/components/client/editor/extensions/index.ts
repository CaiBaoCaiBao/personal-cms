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
            allowBase64: false,
        }),
        Subscript.extend({
            excludes: "superscript",
        }),
        Superscript.extend({
            excludes: "subscript",
        }),
    ]
}