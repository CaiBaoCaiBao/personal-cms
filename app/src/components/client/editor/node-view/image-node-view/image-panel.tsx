"use client";
import { Align } from ".";
import { Button } from "@/components/ui/button";
import { Captions } from "lucide-react";
import { Trash2 } from "lucide-react";
import {
    AlignLeft,
    AlignCenter,
    AlignRight
} from "lucide-react";

export const alignOptions: Array<{
    value: Align;
    icon: typeof AlignLeft;
    label: string;
}> = [
        { value: "left", icon: AlignLeft, label: "Align left" },
        { value: "center", icon: AlignCenter, label: "Align center" },
        { value: "right", icon: AlignRight, label: "Align right" },
    ];

interface ImagePanelProps {
    align: Align;
    hasCaption: boolean;
    captionOpen: boolean;
    setAlign: (align: Align) => void;
    deleteNode: () => void;
    onCaptionOpen: () => void;
}

function preventEditorBlur(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
}

export function ImagePanel({
    align,
    hasCaption,
    captionOpen,
    setAlign,
    deleteNode,
    onCaptionOpen,
}: ImagePanelProps) {
    return (
        <div
            data-image-panel
            className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"
            onMouseDown={preventEditorBlur}
        >
            <div className="pointer-events-auto flex items-center gap-1 rounded-md border border-border bg-background p-1 shadow-sm">
                {alignOptions.map(({ value, icon: Icon, label }) => (
                    <Button
                        key={value}
                        type="button"
                        variant={align === value ? "secondary" : "ghost"}
                        size="icon-sm"
                        aria-label={label}
                        title={label}
                        aria-pressed={align === value}
                        onMouseDown={preventEditorBlur}
                        onClick={() => setAlign(value)}
                    >
                        <Icon />
                    </Button>
                ))}

                <div className="mx-1 h-4 w-px bg-border" aria-hidden />

                <Button
                    type="button"
                    variant={hasCaption || captionOpen ? "secondary" : "ghost"}
                    size="icon-sm"
                    aria-label="Caption"
                    title="Caption"
                    aria-pressed={hasCaption || captionOpen}
                    onMouseDown={preventEditorBlur}
                    onClick={onCaptionOpen}
                >
                    <Captions />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete image"
                    title="Delete"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onMouseDown={preventEditorBlur}
                    onClick={deleteNode}
                >
                    <Trash2 />
                </Button>
            </div>
        </div>
    );
}