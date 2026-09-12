import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNodeView } from '../node-view';
import { Plugin, PluginKey, NodeSelection } from "@tiptap/pm/state";

export const ImageExtension = Image.extend({
    name: "image",

    addAttributes() {
        return {
            ...this.parent?.(),
            align: {
                default: "center",
                parseHTML: (el) => el.getAttribute("data-align") ?? "center",
                renderHTML: (attrs) => ({ "data-align": attrs.align }),
            },
            width: {
                default: null,
                parseHTML: (el) => {
                    const w = el.getAttribute("width");
                    return w ? Number(w) : null;
                },
                renderHTML: (attrs) =>
                    attrs.width ? { width: attrs.width } : {},
            },
            height: {
                default: null,
                parseHTML: (el) => {
                    const h = el.getAttribute("height");
                    return h ? Number(h) : null;
                },
                renderHTML: (attrs) =>
                    attrs.height ? { height: attrs.height } : {},
            },
            caption: {
                default: "",
                parseHTML: (el) =>
                    el.getAttribute("data-caption") ??
                    el.getAttribute("title") ??
                    "",
                renderHTML: (attrs) =>
                    attrs.caption
                        ? { "data-caption": attrs.caption, title: attrs.caption }
                        : {},
            },
        }
    },

    addProseMirrorPlugins() {
        return [
            ...(this.parent?.() ?? []),
            new Plugin({
                key: new PluginKey("imageClickHandler"),
                props: {
                    handleClickOn(view, _pos, node, nodePos, event) {
                        if (node.type.name !== "image") return false;
                        event.preventDefault();
                        const tr = view.state.tr.setSelection(
                            NodeSelection.create(view.state.doc, nodePos),
                        );
                        view.dispatch(tr);
                        return true;
                    },
                },
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView);
    },
})