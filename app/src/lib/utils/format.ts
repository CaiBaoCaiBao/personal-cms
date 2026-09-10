/**
 * @description 格式化工具
 */

export type DateInput = Date | string | number;

export const DATE_FORMAT = {
    datetime: "YYYY-MM-DD HH:mm:ss",
    date: "YYYY-MM-DD",
    time: "HH:mm:ss",
    compact: "YYYYMMDDHHmmss",
} as const;

type DateParts = {
    YYYY: string;
    YY: string;
    M: string;
    MM: string;
    D: string;
    DD: string;
    H: string;
    HH: string;
    h: string;
    hh: string;
    m: string;
    mm: string;
    s: string;
    ss: string;
    SSS: string;
    A: string;
    a: string;
};

const TOKEN_RE =
    /\[([^\]]*)\]|YYYY|YY|SSS|MM|DD|HH|hh|mm|ss|A|a|M|D|H|h|m|s/g;

function pad(value: number, length = 2) {
    return String(value).padStart(length, "0");
}

function toDate(input: DateInput): Date {
    if (input instanceof Date) return input;
    return new Date(input);
}

function hour12(hours: number) {
    const value = hours % 12;
    return value === 0 ? 12 : value;
}

function getDateParts(date: Date, utc: boolean): DateParts {
    const year = utc ? date.getUTCFullYear() : date.getFullYear();
    const month = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    const day = utc ? date.getUTCDate() : date.getDate();
    const hours = utc ? date.getUTCHours() : date.getHours();
    const minutes = utc ? date.getUTCMinutes() : date.getMinutes();
    const seconds = utc ? date.getUTCSeconds() : date.getSeconds();
    const milliseconds = utc
        ? date.getUTCMilliseconds()
        : date.getMilliseconds();
    const meridiem = hours < 12 ? "AM" : "PM";
    const h = hour12(hours);

    return {
        YYYY: String(year),
        YY: String(year).slice(-2),
        M: String(month),
        MM: pad(month),
        D: String(day),
        DD: pad(day),
        H: String(hours),
        HH: pad(hours),
        h: String(h),
        hh: pad(h),
        m: String(minutes),
        mm: pad(minutes),
        s: String(seconds),
        ss: pad(seconds),
        SSS: pad(milliseconds, 3),
        A: meridiem,
        a: meridiem.toLowerCase(),
    };
}

/**
 * @description 按模板格式化日期
 * @param date Date / ISO 字符串 / 时间戳
 * @param format 模板，默认 `YYYY-MM-DD HH:mm:ss`。`[...]` 内为字面量
 * @param options.utc 使用 UTC 而不是本地时区
 * @example
 * formatDate(new Date(), "YYYY-MM-DD")
 * formatDate(Date.now(), "YYYY年MM月DD日 HH:mm")
 * formatDate("2026-09-10T10:00:00Z", "YYYY-MM-DD HH:mm", { utc: true })
 * formatDate(new Date(), "[Year:]YYYY")
 */
export function formatDate(
    date: DateInput,
    format: string = DATE_FORMAT.datetime,
    options?: { utc?: boolean },
): string {
    const parsed = toDate(date);
    if (Number.isNaN(parsed.getTime())) return "";

    const parts = getDateParts(parsed, options?.utc ?? false);
    return format.replace(TOKEN_RE, (token, literal: string | undefined) => {
        if (literal !== undefined) return literal;
        return parts[token as keyof DateParts];
    });
}

/**
 * @description 格式化字节为可读性更好的字符串
 * @param bytes 
 * @returns 格式化后的字节字符串
 * @example
 * formatBytes(1024) // 1KB
 * formatBytes(1024 * 1024) // 1MB
 * formatBytes(1024 * 1024 * 1024) // 1GB
 * formatBytes(1024 * 1024 * 1024 * 1024) // 1TB
 */
export function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, index)).toFixed(2) + ' ' + units[index];
}