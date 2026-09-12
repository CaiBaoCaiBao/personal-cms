"use client";

import { MenuBtn } from "./menu-btn";
import { menuBarConfig } from "./menu-btn-config";
import { cn } from "@/lib/utils";
import { MenuDropdown } from "./menu-dropdown";
import { Separator } from "@/components/ui/separator";

interface Props {
    className?: string
}

export function FixedMenuBar({ className }: Props) {
    return (
        <div className={cn("flex flex-wrap items-center gap-1", className)}>
            {menuBarConfig.map((menuBar, index) => (
                <div key={menuBar.group} className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                        {menuBar.children.map((child) => {
                            if ("items" in child) {
                                return <MenuDropdown key={child.id} config={child} />
                            }
                            return <MenuBtn key={child.id} config={child} />
                        })}
                    </div>
                    <Separator orientation="vertical" className="w-px" hidden={index === menuBarConfig.length - 1} />
                </div>
            ))}
        </div>
    );
}