"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

interface Props {
    children?: React.ReactNode;
    className?: string;
    draggable?: boolean;
    enableDrop?: boolean
    openFileDialog: () => void;
    getInputProps:
    (props: InputHTMLAttributes<HTMLInputElement>) =>
        InputHTMLAttributes<HTMLInputElement>;
    onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function FileUpload({
    children,
    className,
    draggable,
    enableDrop,
    openFileDialog,
    getInputProps,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop
}: Props) {

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (enableDrop) {
            onDragEnter?.(e);
        }
    }
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (enableDrop) {
            onDragLeave?.(e);
        }
    }
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (enableDrop) {
            onDragOver?.(e);
        }
    }
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (enableDrop) {
            onDrop?.(e);
        }
    }
    return (
        <div>
            <input type="file" hidden {...getInputProps({
                className: "sr-only"
            })} />
            <div
                role={draggable ? "button" : undefined}
                tabIndex={0}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openFileDialog();
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn("min-w-0 select-none", className)}
            >
                {children}
            </div>
        </div>
    )
}