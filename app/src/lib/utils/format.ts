/**
 * @description 格式化工具
 */

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