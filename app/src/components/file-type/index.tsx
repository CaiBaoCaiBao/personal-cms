import {
    ComponentProps,
    ReactNode,
    CSSProperties,
} from "react";
import {
    CATEGORY_NAMES,
    type FileTypeName,
} from "./constant";
import {
    fileTypeVariants,
    type FileTypeVariant,
    MONO,
    PAGE_CLASS,
    LABEL_CLASS,
    LABEL_TEXT_CLASS,
    FOLD_CLASS,
    GLYPH_CLASS,
} from "./variant";
import type { VariantProps } from "class-variance-authority";
import { resolveFileType } from "@/lib/utils";
import {
    GLYPHS,
    STROKE,
    PAGE_PATH,
    PAGE_PATH_SQUARE,
    FOLD_PATH,
    FOLD_PATH_SQUARE,
    FLAP_PATH,
    FLAP_PATH_SQUARE,
    ROUND,
    SQUARE
} from "./glyphs";
import { cn } from "@/lib/utils";

interface Props extends Omit<ComponentProps<"span">, "children"> {
    type?: FileTypeName | (string & {});
    variant?: FileTypeVariant;
    size?: VariantProps<typeof fileTypeVariants>["size"];
    label?: ReactNode;
    glyph?: boolean;
    icon?: ReactNode;
    labelClassName?: string;
}

export function FileType({
    type,
    variant = "outline",
    size = "default",
    label,
    glyph,
    icon,
    labelClassName,
    className,
    ...props
}: Props) {
    const resolved = resolveFileType(type);
    const text = label !== undefined ? label : resolved.label
    const hasText = text !== undefined && text !== null && text !== "";
    const spelled = resolved.label ? resolved.type.toUpperCase() : undefined
    const typeName = spelled
        ? `${spelled} file`
        : CATEGORY_NAMES[resolved.category];
    const custom = typeof label === "string" ? label.toUpperCase() : ""
    const name =
        custom && custom !== resolved.label && custom !== spelled
            ? `${label}, ${typeName}`
            : typeName
    const hasIcon = icon !== undefined && icon !== null && icon !== false
    const showLabel = hasText && !glyph && !hasIcon
    const glyphNode = showLabel || hasIcon ? null : GLYPHS[resolved.category]
    return (
        <span
            role="img"
            aria-label={name}
            data-slot="file-type"
            data-type={resolved.type}
            data-category={resolved.category}
            data-variant={variant}
            data-size={size}
            className={cn(
                fileTypeVariants({ size }),
                variant === "mono" ? MONO : resolved.color,
                className
            )}
            {...props}
        >
            <svg
                data-slot="file-type-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                className={cn(
                    "absolute inset-0 size-full overflow-visible [stroke-width:var(--file-type-stroke,max(1px,2.5cqw))] [--file-type-outline:var(--file-type-border,color-mix(in_oklab,var(--muted-foreground)_40%,transparent))] @max-[21px]:[--file-type-outline:var(--file-type-border,color-mix(in_oklab,var(--muted-foreground)_65%,transparent))]",
                    "style-vega:[--file-type-round:inline] style-nova:[--file-type-round:inline] style-maia:[--file-type-round:inline] style-lyra:[--file-type-round:none] style-mira:[--file-type-round:inline] style-luma:[--file-type-round:inline] style-rhea:[--file-type-round:inline] style-sera:[--file-type-round:none]",
                    "style-vega:[--file-type-square:none] style-nova:[--file-type-square:none] style-maia:[--file-type-square:none] style-lyra:[--file-type-square:inline] style-mira:[--file-type-square:none] style-luma:[--file-type-square:none] style-rhea:[--file-type-square:none] style-sera:[--file-type-square:inline]"
                )}
            >
                <path
                    {...STROKE}
                    d={PAGE_PATH}
                    className={cn(PAGE_CLASS[variant], ROUND)}
                />
                <path
                    {...STROKE}
                    d={PAGE_PATH_SQUARE}
                    strokeLinejoin="miter"
                    className={cn(PAGE_CLASS[variant], SQUARE)}
                />
                {variant === "solid" ? (
                    <>
                        <path
                            d={FLAP_PATH}
                            className={cn("fill-white/30 stroke-none", ROUND)}
                        />
                        <path
                            d={FLAP_PATH_SQUARE}
                            className={cn("fill-white/30 stroke-none", SQUARE)}
                        />
                    </>
                ) : null}
                <path
                    {...STROKE}
                    d={FOLD_PATH}
                    className={cn(FOLD_CLASS[variant], ROUND)}
                />
                <path
                    {...STROKE}
                    d={FOLD_PATH_SQUARE}
                    strokeLinejoin="miter"
                    className={cn(FOLD_CLASS[variant], SQUARE)}
                />
                {glyphNode ? (
                    <g
                        data-slot="file-type-glyph"
                        stroke="currentColor"
                        className={cn(
                            "origin-[12px_15px] scale-75 @max-[21px]:scale-100",
                            GLYPH_CLASS[variant]
                        )}
                    >
                        {glyphNode}
                    </g>
                ) : null}
            </svg>
            {hasIcon ? (
                <span
                    data-slot="file-type-custom-icon"
                    aria-hidden="true"
                    className={cn(
                        "absolute top-[62.5%] left-1/2 flex size-[37.5cqw] -translate-1/2 items-center justify-center @max-[21px]:size-[50cqw] [&>svg]:size-full",
                        GLYPH_CLASS[variant]
                    )}
                >
                    {icon}
                </span>
            ) : null}
            {showLabel ? (
                <span
                    data-slot="file-type-label"
                    style={
                        {
                            "--file-type-chars": typeof text === "string" ? text.length : 4,
                        } as CSSProperties
                    }
                    className={cn(
                        "absolute top-(--file-type-label-y) left-[5%] flex h-(--file-type-label-h) max-w-[95%] items-center justify-center overflow-hidden rounded-[var(--file-type-radius,var(--file-type-label-radius,10cqw))] px-[var(--file-type-label-px,7cqw)] font-medium whitespace-nowrap",
                        "text-[length:min(24cqw,calc((95cqw-2*var(--file-type-label-px,7cqw))/(var(--file-type-chars)*0.72)))] [--file-type-label-h:35%] [--file-type-label-y:45%]",
                        "supports-[margin:round(1cap,1px)]:mt-[calc(round(nearest,calc(var(--file-type-label-y)+(var(--file-type-label-h)+1cap)/2),1px)-var(--file-type-label-y)-(var(--file-type-label-h)+1cap)/2)]",
                        "@max-[21px]:px-[4cqw] @max-[21px]:text-[length:min(32.5cqw,5.8px,calc(87cqw/(var(--file-type-chars)*0.88)))] @max-[21px]:font-semibold @max-[21px]:[--file-type-label-h:45%] @max-[21px]:[--file-type-label-y:40%]",
                        "style-vega:[--file-type-label-radius:10cqw] style-nova:[--file-type-label-radius:10cqw] style-maia:[--file-type-label-radius:17.5cqw] style-lyra:[--file-type-label-radius:0px] style-mira:[--file-type-label-radius:10cqw] style-luma:[--file-type-label-radius:17.5cqw] style-rhea:[--file-type-label-radius:17.5cqw] style-sera:[--file-type-label-radius:0px]",
                        "style-vega:[--file-type-label-px:7cqw] style-nova:[--file-type-label-px:7cqw] style-maia:[--file-type-label-px:10.5cqw] style-lyra:[--file-type-label-px:7cqw] style-mira:[--file-type-label-px:7cqw] style-luma:[--file-type-label-px:10.5cqw] style-rhea:[--file-type-label-px:10.5cqw] style-sera:[--file-type-label-px:7cqw]",
                        LABEL_CLASS[variant],
                        labelClassName
                    )}
                >
                    <span
                        className={cn(
                            "max-w-[min(95cqw,calc(100%+2*max(0px,var(--file-type-label-px,7cqw)-7cqw)))] shrink-0 truncate py-[0.25em] [text-box:trim-both_cap_alphabetic] @max-[21px]:max-w-full",
                            LABEL_TEXT_CLASS[variant]
                        )}
                    >
                        {text}
                    </span>
                </span>
            ) : null}
        </span>
    )
}