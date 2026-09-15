/** 
 * @description 判断是否为空，支持对象、数组、字符串、数字、布尔值、函数、符号、空对象、空数组、空字符串、空符号、空函数
 * @param val 需要判断的值
 * @returns 是否为空
 */
export function isEmpty(val: unknown): boolean {
    if (val === null || val === undefined) return true;
    // 字符串
    if (typeof val === "string") return val.trim().length === 0;
    // 数组
    if (Array.isArray(val)) return val.length === 0;
    // Map / Set 映射
    if (val instanceof Map || val instanceof Set) return val.size === 0;
    // 普通对象（无自有可枚举键）
    if (typeof val === 'object') {
        return Object.keys(val as object).length === 0;
    }
    return false;
}