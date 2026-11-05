// Helper function to format bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / k ** i).toFixed(dm)) + sizes[i]
};

/** @description 按格式串格式化日期，支持 YYYY、YY、MM、DD、HH、mm、ss */
export const formatDate = (date: Date, formatStr: string): string => {
    const pad = (value: number) => String(value).padStart(2, "0");
    const year = date.getFullYear();
    const tokens: Record<string, string> = {
        YYYY: String(year),
        YY: String(year).slice(-2),
        MM: pad(date.getMonth() + 1),
        DD: pad(date.getDate()),
        HH: pad(date.getHours()),
        mm: pad(date.getMinutes()),
        ss: pad(date.getSeconds()),
    };

    return formatStr.replace(/YYYY|YY|MM|DD|HH|mm|ss/g, (token) => tokens[token]);
};