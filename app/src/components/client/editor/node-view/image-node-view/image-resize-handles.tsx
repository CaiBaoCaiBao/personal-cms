"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const MIN_WIDTH = 200;

interface ImageResizeHandlesProps {
    imgRef: React.RefObject<HTMLImageElement | null>;
    width: number | null;
    onCommit: (width: number) => void;
}

function ResizeHandle({
    side,
    onPointerDown,
}: {
    side: "left" | "right";
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
    return (
        <div
            role="presentation"
            aria-hidden
            data-resize-handle={side}
            data-side={side}
            onPointerDown={onPointerDown}
            className={cn(
                "group/handle pointer-events-auto absolute top-0 bottom-0 z-10 flex w-11 cursor-ew-resize items-center justify-center touch-none select-none",
                side === "left" ? "-left-5.5" : "-right-5.5",
            )}
        >
            <span
                className={cn(
                    "pointer-events-none size-3 rounded-[3px] bg-background",
                    "shadow-[0_0_0_1.5px_var(--foreground),0_1px_2px_rgba(0,0,0,0.25)]",
                    "transition-transform duration-100",
                    "group-hover/handle:scale-125",
                    "group-active/handle:scale-110 group-active/handle:bg-foreground",
                )}
            />
        </div>
    );
}

export function ImageResizeHandles({
    imgRef,
    width,
    onCommit,
}: ImageResizeHandlesProps) {
    const [liveWidth, setLiveWidth] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const pendingWidthRef = useRef<number | null>(null);

    const startResize = (side: "left" | "right") => (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);

        const img = imgRef.current;
        if (!img) return;

        setIsResizing(true);
        const startX = e.clientX;
        const startWidth = width ?? img.offsetWidth;

        const onMove = (ev: PointerEvent) => {
            const delta = ev.clientX - startX;
            const next = side === "right" ? startWidth + delta : startWidth - delta;
            const w = Math.max(MIN_WIDTH, Math.round(next));
            pendingWidthRef.current = w;
            setLiveWidth(w);
        };

        const cleanup = () => {
            target.removeEventListener("pointermove", onMove);
            target.removeEventListener("pointerup", onUp);
            target.removeEventListener("pointercancel", onCancel);
            target.releasePointerCapture(e.pointerId);
            setIsResizing(false);
        };

        const onUp = () => {
            cleanup();
            const finalWidth = pendingWidthRef.current;
            pendingWidthRef.current = null;
            setLiveWidth(null);
            if (finalWidth != null) onCommit(finalWidth);
        };

        const onCancel = () => {
            cleanup();
            pendingWidthRef.current = null;
            setLiveWidth(null);
        };

        target.addEventListener("pointermove", onMove);
        target.addEventListener("pointerup", onUp);
        target.addEventListener("pointercancel", onCancel);
    };

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;
        if (liveWidth != null) {
            img.style.width = `${liveWidth}px`;
            img.style.height = "auto";
        }
    }, [liveWidth, imgRef]);

    return (
        <div
            data-resizing={isResizing}
            className={cn(
                "group/root pointer-events-none absolute inset-0 rounded-lg",
                "shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_55%,transparent)]",
                isResizing && "shadow-[0_0_0_2px_var(--foreground)]",
            )}
        >
            {liveWidth != null && (
                <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] font-medium tabular-nums tracking-tight text-background shadow-sm">
                    {liveWidth}
                </div>
            )}
            <ResizeHandle side="left" onPointerDown={startResize("left")} />
            <ResizeHandle side="right" onPointerDown={startResize("right")} />
        </div>
    );
}