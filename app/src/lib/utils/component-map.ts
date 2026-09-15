import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const componentMap: Record<string, ComponentType<any>> = {
    SystemRouter: dynamic(() => import("@/components/server/system-router").then(mod => mod.SystemRouter)),
    SystemPage: dynamic(() => import("@/components/server/system-page").then(mod => mod.SystemPage)),
}

export function resolveComponent(componentName: string) {
    const Component = componentMap[componentName];
    return Component;
}