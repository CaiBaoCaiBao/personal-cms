"use strict";
import { isEmpty } from "../is-empty";

/**
 * @description 深度克隆对象，返回一个新的对象，不会影响原对象
 * @param obj 需要克隆的对象
 * @returns 克隆后的对象
 */
export function deepCloneObj(obj: Record<string, any>) {
    if (typeof obj !== 'object' || isEmpty(obj)) {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}