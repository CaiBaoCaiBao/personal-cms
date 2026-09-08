'use strict';
import { isEmpty } from "../is-empty";

/**
 * @description 深度冻结对象，返回一个新的对象，不会影响原对象
 * @param obj 需要深度冻结的对象
 * @returns 深度冻结后的对象
 */
export function deepFrozenObj(obj: Record<string, any>) {
    if (typeof obj !== 'object' || isEmpty(obj)) {
        return obj;
    }
    Object.freeze(obj);
    Object.keys(obj).forEach(key => {
        deepFrozenObj(obj[key]);
    });
    return obj;
}