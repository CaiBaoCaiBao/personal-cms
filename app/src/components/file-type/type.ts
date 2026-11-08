// 文件类型分类
export type FileTypeCategory =
    | "archive"
    | "audio"
    | "code"
    | "design"
    | "document"
    | "empty"
    | "executable"
    | "file"
    | "folder"
    | "font"
    | "image"
    | "presentation"
    | "spreadsheet"
    | "video";

export type FileTypeExtension = {
    category: FileTypeCategory;
    color: string;
    label?: string;
};
