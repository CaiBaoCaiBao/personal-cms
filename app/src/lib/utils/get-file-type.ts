import type {
    FileTypeCategory,
    FileTypeExtension
} from "@/components/file-type/type";
import {
    CATEGORY_COLORS,
    FILE_TYPE_CATEGORIES,
    FILE_TYPE_EXTENSIONS,
    URL_ORIGIN,
    MIME_PATTERN,
    NAME_END,
    type FileTypeName,
    MIME_TYPES,
    MIME_FAMILIES,
    FILE_NAMES,
    EXTENSION_ALIASES,
    NAME_PATTERNS,
} from "@/components/file-type/constant";

type ResolvedFileType = {
    type: string
    category: FileTypeCategory
    /** @description 扩展标签, 或 undefined 对于一个家族或一个空文件. */
    label?: string
    color: string
}

function has(record: object, key: string) {
    return Object.prototype.hasOwnProperty.call(record, key)
}

function isCategory(value: string): value is FileTypeCategory {
    return (FILE_TYPE_CATEGORIES as readonly string[]).includes(value)
}
const extensions: Record<string, FileTypeExtension> = FILE_TYPE_EXTENSIONS;
/** @description 解析文件类型 */
export function resolveFileType(type?: string): ResolvedFileType {

    const key = (type ?? "").trim().toLowerCase().replace(/^\.+/, "")

    if (!key || key === "empty") {
        return { type: "empty", category: "empty", color: CATEGORY_COLORS.empty }
    }

    const extension = has(extensions, key) ? extensions[key] : null
    if (extension) {
        return {
            type: key,
            category: extension.category,
            label: extension.label ?? key.toUpperCase(),
            color: extension.color,
        }
    }

    if (isCategory(key)) {
        return { type: key, category: key, color: CATEGORY_COLORS[key] }
    }

    return {
        type: key,
        category: "file",
        label: key.toUpperCase(),
        color: CATEGORY_COLORS.file,
    }
}

/** @description 获取文件类型 */
export function getFileType(value: string): FileTypeName | (string & {}) {
    let input = value.trim().toLowerCase()

    // A URL is read by its path, so a bare host is not a ".com" file. A "?" or
    // "#" can be part of a plain name ("invoice #12.pdf"), so outside a URL it
    // starts a query only when the value does not already end like a name.
    if (URL_ORIGIN.test(input)) {
        input = input.split(/[?#]/)[0].replace(URL_ORIGIN, "")
        if (input === "/") return "empty"
    } else if (!NAME_END.test(input)) {
        input = input.split(/[?#]/)[0]
    }
    if (!input) return "empty"
    if (input.endsWith("/") || input.endsWith("\\")) return "folder"

    const mime = input.split(";")[0].trim()
    if (MIME_PATTERN.test(mime)) {
        if (has(MIME_TYPES, mime)) return MIME_TYPES[mime]
        const [family, subtype] = mime.split("/")
        // A known extension after a dot makes it a storage key ("image/a.png").
        const tail = subtype.slice(subtype.lastIndexOf(".") + 1)
        if (subtype.includes(".") && has(extensions, tail)) return tail
        // A media subtype counts only inside its own family: audio/webm is audio.
        if (
            has(extensions, subtype) &&
            (family === "application" ||
                family === "text" ||
                extensions[subtype].category === family)
        ) {
            return subtype
        }
        return has(MIME_FAMILIES, family) ? MIME_FAMILIES[family] : "empty"
    }

    const name = input.split(/[\\/]/).pop() ?? ""
    if (has(FILE_NAMES, name)) return FILE_NAMES[name]
    const dot = name.lastIndexOf(".")
    const extension = name.slice(dot + 1)
    if (has(EXTENSION_ALIASES, extension)) return EXTENSION_ALIASES[extension]
    if (!has(extensions, extension)) {
        const match = NAME_PATTERNS.find(([pattern]) => pattern.test(name))
        if (match) return match[1]
    }
    // No dot, or only a leading one: a bare extension or family ("pdf",
    // ".pdf", "image") resolves, anything else ("notes", ".hidden") has no type.
    if (dot <= 0) {
        return resolveFileType(extension).category === "file" ? "empty" : extension
    }

    return extension || "empty"
}

/** @description 获取文件类型分类 */
export function getFileTypeCategory(type?: string): FileTypeCategory {
    return resolveFileType(type).category
}