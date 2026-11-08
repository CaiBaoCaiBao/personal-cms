"use client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    InputHTMLAttributes,
    Ref,
    DragEvent,
} from "react";

interface Props {
    id?: string;
    children: React.ReactNode;
    className?: string;
    getInputProps: (props: InputHTMLAttributes<HTMLInputElement>) =>
        InputHTMLAttributes<HTMLInputElement> & {
            ref: Ref<HTMLInputElement>
        },
    handleOpenDialog: () => void;
    handleDragOver: (e: DragEvent<HTMLElement>) => void;
    handleDragLeave: (e: DragEvent<HTMLElement>) => void;
    handleDragEnter: (e: DragEvent<HTMLElement>) => void;
    handleDrop: (e: DragEvent<HTMLElement>) => void;
}

export function FileUpload({
    id,
    children,
    className,
    getInputProps,
    handleOpenDialog,
    handleDragOver,
    handleDragLeave,
    handleDragEnter,
    handleDrop
}: Props) {

    return (
        <div
            role="button"
            tabIndex={-1}
            onClick={handleOpenDialog}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            className={cn(
                className ? "w-full" : "w-fit",
                className
            )}>
            <Input {...getInputProps({})} id={id} />
            {children}
        </div>
    )
}