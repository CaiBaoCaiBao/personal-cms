import {
    useState,
    useRef,
    useEffect,
    useCallback
} from "react";

type DebounceOptions = {
    leading?: boolean;
}

/**
 * @description 防抖函数
 * @param callback - 回调函数
 * @param delay - 延迟时间
 * @param options.leading - 是否在执行时立即执行
 * @returns debouncedFn: 防抖函数, cancel: 取消防抖函数
 * @example
 * const {debouncedFn, cancel} = useDebounce(callback, 1000, {leading: true});
 * debouncedFn();
 * cancel();
 */
export function useDebounce(
    callback: (...args: any) => void,
    delay: number = 300, // 默认 300ms
    options: DebounceOptions = {}
) {
    const { leading = false } = options;
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);

    // 防抖函数
    const debouncedFn = useCallback((...args: any) => {
        if (leading && !timer.current) callbackRef.current(...args);
        if (timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            callbackRef.current(...args);
            timer.current = null;
        }, delay);

    }, [delay, leading]);

    // 取消防抖
    const cancel = useCallback(() => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    // 更新回调函数
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // 组件卸载时取消防抖
    useEffect(() => {
        return () => {
            cancel();
        }
    }, [cancel])

    // 返回防抖函数和取消防抖函数
    return {debouncedFn, cancel};
}