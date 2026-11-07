import "server-only";
import { pinyin } from "pinyin-pro";

const SLUG_MAX_LENGTH = 80 as const;

/**
 *  @description 生成slug
 *  @param text - 要生成的文本
 *  @returns 生成的slug
 *  @example
 *  generateSlug("Hello World") => "hello-world"
 *  generateSlug("你好，世界") => "ni-hao-shi-jie"
 *  generateSlug("Hello, World!") => "hello-world"
 *  generateSlug("Hello, World!") => "hello-world"
 *  */
export function generateSlug(text: string): string {
    const normalized = text.normalize("NFKC").trim();
    if (!normalized) return "";

    const pinyinText = pinyin(normalized, {
        toneType: "none",
        nonZh: "consecutive",
        v: true,
    });
    const slug = pinyinText
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (slug.length <= SLUG_MAX_LENGTH) return slug;

    const truncated = slug.slice(0, SLUG_MAX_LENGTH);
    const boundary = truncated.lastIndexOf("-");
    return boundary > 0 ? truncated.slice(0, boundary) : truncated;
}

/** @description 获取下一个可用的slug */
/** @param base - 基础slug
 * @param taken - 已使用的slug列表
 * @returns 下一个可用的slug
 * @example
 * nextSlug("hello", ["hello-1", "hello-2"]) => "hello-3"
 */
export function nextSlug(base: string, taken: string[]): string {
    const used = new Set(taken);
    if (!used.has(base)) return base;

    const pattern = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)$`);
    let max = 1;
    for (const slug of used) {
        const match = pattern.exec(slug);
        if (match) max = Math.max(max, Number(match[1]));
    }

    const suffix = `-${max + 1}`;
    const room = SLUG_MAX_LENGTH - suffix.length;
    const stem = base.length > room ? base.slice(0, room).replace(/-+$/g, "") : base;
    return `${stem}${suffix}`;
}