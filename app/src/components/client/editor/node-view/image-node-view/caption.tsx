"use client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    useRef,
    useEffect,
} from "react";

interface ImageCaptionProps {
    editable: boolean;
    captionOpen: boolean;
    caption: string;
    setCaption: (caption: string) => void;
    onEdit: () => void;
    onClose: () => void;
}

export function ImageCaption({
    editable,
    captionOpen,
    caption,
    setCaption,
    onEdit,
    onClose,
}: ImageCaptionProps) {
    const hasCaption = Boolean(caption.trim());
    const visible = hasCaption || captionOpen;
    const captionInputRef = useRef<HTMLInputElement>(null);

    const onCaptionBlur = () => {
        if (!caption.trim()) {
            setCaption("");
        }
        onClose();
    };

    useEffect(() => {
        if (!captionOpen) return;
        captionInputRef.current?.focus({ preventScroll: true });
    }, [captionOpen]);

    if (!visible) return null;

    return (
        <div className="relative flex justify-center">
            {captionOpen && editable ? (
                <Input
                    ref={captionInputRef}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onBlur={onCaptionBlur}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    autoFocus
                    placeholder="Caption"
                    className="text-center"
                />
            ) : (
                <figcaption
                    className={cn(
                        "text-center text-sm text-muted-foreground",
                        editable && "cursor-pointer",
                    )}
                    onClick={editable ? onEdit : undefined}
                >
                    {caption}
                </figcaption>
            )}
        </div>
    );
}