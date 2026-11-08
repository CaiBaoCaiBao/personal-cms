import { cva } from "class-variance-authority";

export const fileTypeVariants = cva(
    [
        "@container relative inline-block shrink-0 align-middle leading-none select-none",
        "size-(--file-type-size)",
        "[--file-type-foreground:white]",
    ],
    {
        variants: {
            size: {
                mini: "[--file-type-size:--spacing(4.5)]",
                xs: "[--file-type-size:--spacing(6)]",
                sm: "[--file-type-size:--spacing(8)]",
                default: "[--file-type-size:--spacing(10)]",
                lg: "[--file-type-size:--spacing(12)]",
                xl: "[--file-type-size:--spacing(14)]",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

export type FileTypeVariant = "outline" | "solid" | "light" | "mono";

export const MONO = "text-muted-foreground [--file-type-foreground:var(--background)]";
export const PAGE_CLASS: Record<FileTypeVariant, string> = {
    outline: "fill-transparent stroke-(color:--file-type-outline)",
    light: "fill-muted stroke-(color:--file-type-outline)",
    solid:
        "fill-[var(--file-type-fill,currentColor)] stroke-[var(--file-type-fill,currentColor)]",
    mono: "fill-transparent stroke-(color:--file-type-outline)",
};
export const FOLD_CLASS: Record<FileTypeVariant, string> = {
    outline: "stroke-(color:--file-type-outline)",
    light: "stroke-(color:--file-type-outline)",
    solid: "stroke-white/45",
    mono: "stroke-(color:--file-type-outline)",
};
export const GLYPH_CLASS: Record<FileTypeVariant, string> = {
    outline: "dark:text-[color-mix(in_oklab,currentColor_70%,white)]",
    light: "dark:text-[color-mix(in_oklab,currentColor_70%,white)]",
    solid: "text-[color:var(--file-type-glyph,var(--file-type-foreground))]",
    mono: "",
};
export const LABEL_TEXT_CLASS: Record<FileTypeVariant, string> = {
    outline: "text-(color:--file-type-foreground)",
    light: "text-(color:--file-type-foreground)",
    solid:
        "max-w-[calc(200cqw/3)] text-[color:var(--file-type-glyph,var(--file-type-foreground))]",
    mono: "text-(color:--file-type-foreground)",
};

export const LABEL_CLASS: Record<FileTypeVariant, string> = {
    outline: "bg-current",
    light: "bg-current",
    solid:
        "left-1/6 w-2/3 px-[3cqw] text-[length:min(20.5cqw,calc(65.6cqw/(var(--file-type-chars)*0.8)))] @max-[21px]:px-0 @max-[21px]:text-[length:min(32.5cqw,5.8px,calc(66cqw/(var(--file-type-chars)*0.9)))]",
    mono: "bg-current",
};