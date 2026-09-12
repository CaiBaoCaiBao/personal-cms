import {
    useState,
    useEffect
} from "react";
export function useIsCoarsePointer() {
    const [isCoarse, setIsCoarse] = useState(false);
    useEffect(() => {
        setIsCoarse(globalThis.matchMedia("(pointer: coarse)").matches);
    }, []);
    return isCoarse;
}