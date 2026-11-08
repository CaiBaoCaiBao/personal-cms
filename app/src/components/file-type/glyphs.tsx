import type { FileTypeCategory } from "./type";
import type { ReactNode } from "react";

export const STROKE = { vectorEffect: "non-scaling-stroke" } as const;

export const GLYPHS: Partial<Record<FileTypeCategory, ReactNode>> = {
    document: <path {...STROKE} d="M8 12h8M8 15h5.5M8 18h7" />,
    spreadsheet: (
        <>
            <rect {...STROKE} x="7.5" y="11" width="9" height="8" rx="1" />
            <path {...STROKE} d="M7.5 14.5h9M11 11v8" />
        </>
    ),
    presentation: (
        <>
            <rect {...STROKE} x="7" y="11" width="10" height="5.5" rx="1" />
            <path {...STROKE} d="m9.5 19.5 2.5-3 2.5 3" />
        </>
    ),
    image: (
        <>
            <path {...STROKE} d="m7 19.5 3.5-5.5 2.75 3.75 1.25-1.75 2.5 3.5Z" />
            <circle {...STROKE} cx="14.25" cy="12" r="1.25" />
        </>
    ),
    video: <path {...STROKE} d="M9.5 11v8l7-4Z" />,
    audio: (
        <>
            <path {...STROKE} d="M12.5 18v-7l3 1.5" />
            <circle {...STROKE} cx="10.75" cy="18" r="1.75" />
        </>
    ),
    code: <path {...STROKE} d="m10 12-3 3 3 3m4-6 3 3-3 3" />,
    archive: (
        <>
            <rect {...STROKE} x="7" y="11" width="10" height="3" rx="0.75" />
            <path
                {...STROKE}
                d="M8 14v4.5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V14M11 16.5h2"
            />
        </>
    ),
    design: (
        <>
            <circle {...STROKE} cx="10.5" cy="13" r="2.5" />
            <rect {...STROKE} x="12" y="14.5" width="5" height="5" rx="1" />
        </>
    ),
    executable: (
        <>
            <rect {...STROKE} x="7.5" y="10.75" width="3.5" height="3.5" rx="0.75" />
            <rect {...STROKE} x="13" y="10.75" width="3.5" height="3.5" rx="0.75" />
            <rect {...STROKE} x="7.5" y="16.25" width="3.5" height="3.5" rx="0.75" />
            <rect {...STROKE} x="13" y="16.25" width="3.5" height="3.5" rx="0.75" />
        </>
    ),
    font: <path {...STROKE} d="M8.5 12.5V11h7v1.5M12 11v8m-1.5 0h3" />,
    folder: (
        <path
            {...STROKE}
            d="M7 12a1 1 0 0 1 1-1h2.25a1 1 0 0 1 .8.4l.9 1.1H16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1Z"
        />
    ),
};

export const PAGE_PATH =
    "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7.586a2 2 0 0 1 1.414.586l4.414 4.414A2 2 0 0 1 20 8.414V20a2 2 0 0 1-2 2Z";
export const FOLD_PATH = "M14 2v5a1 1 0 0 0 1 1h5";
export const FLAP_PATH =
    "M13.586 2a2 2 0 0 1 1.414.586l4.414 4.414A2 2 0 0 1 20 8.414V8h-5a1 1 0 0 1-1-1V2Z";
export const PAGE_PATH_SQUARE = "M4 22V2h10l6 6v14Z";
export const FOLD_PATH_SQUARE = "M14 2v6h6";
export const FLAP_PATH_SQUARE = "M14 2l6 6h-6Z";
export const ROUND = "[display:var(--file-type-round,inline)]";
export const SQUARE = "[display:var(--file-type-square,none)]";