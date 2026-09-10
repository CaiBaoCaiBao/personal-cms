import { useCallback, useRef } from "react";

export function useThrottleCallback(fn: (...args: any[]) => void, delay: number = 300) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    return useCallback((...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fn(...args);
            timeoutRef.current = null;
        }, delay);
    }, [fn, delay]);
}