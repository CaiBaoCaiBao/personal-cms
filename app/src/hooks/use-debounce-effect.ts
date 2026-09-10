import { useEffect, useRef } from "react";

export function useDebounceEffect(fn: () => void, delay: number = 300) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(fn, delay);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [fn, delay, timeoutRef]);
}