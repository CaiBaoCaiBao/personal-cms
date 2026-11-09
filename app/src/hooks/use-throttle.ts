import { useCallback, useEffect, useRef } from "react";

/**
 * @description 节流函数选项
 * @param leading - 是否在节流周期开始时立即调用, 默认 false
 * @param trailing - 是否在节流周期结束时调用, 默认 false
 */
type ThrottleOptions = {
    leading?: boolean;
    trailing?: boolean;
}

/**
 * @description 节流函数
 * @param callback - 回调函数
 * @param delay - 延迟时间
 * @param options - 节流函数选项
 * @returns throttledFn: 节流函数, cancel: 取消防流函数
 * @example
 * const {throttledFn, cancel} = useThrottle(callback, 1000, {leading: true, trailing: true});
 * throttledFn();
 * cancel();
 */
export function useThrottle(
    callback: (...args: any) => void,
    delay: number = 300,
    options: ThrottleOptions = {}
) {
    const { leading = false, trailing = false } = options;
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastArgs = useRef<any[] | null>(null);
    const canRun = useRef(leading);
    const callbackRef = useRef(callback);

    // 更新回调函数引用
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // 节流函数
    const throttledFn = useCallback((...args: any) => {
        if (canRun.current) {
            callbackRef.current(...args);
            canRun.current = false;
            timer.current = setTimeout(() => {
                canRun.current = true;
                if (trailing && lastArgs.current) {
                    callbackRef.current(...lastArgs.current);
                    lastArgs.current = null;
                }
            }, delay);
        } else if (trailing) {
            lastArgs.current = args;
        }
    }, [delay, trailing]);

    // 取消节流
    const cancel = useCallback(() => {
        if (timer.current) {
            clearTimeout(timer.current); // 清除定时器
            timer.current = null; // 重置定时器
        }
        canRun.current = leading; // 根据 leading 重置
        lastArgs.current = null;
    }, [leading]);

    // 组件卸载时清除定时器
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    // 返回节流函数和取消函数
    return { throttledFn, cancel };
}