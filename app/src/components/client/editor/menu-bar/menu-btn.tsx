"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { useState } from "react";
import type { ButtonMenuConfig } from "@/type/editor.type";

interface Props {
    config: ButtonMenuConfig;
    showTooltip?: boolean;
}

export function MenuBtn({ config, showTooltip = true }: Props) {
    const { editor } = useTiptap();
    const Icon = config.icon;
    const [panelOpen, setPanelOpen] = useState(false);

    const state = useTiptapState(({ editor }) => ({
        active: config.isActive(editor),
        disabled: config.disabled(editor),
    }));

    if (!editor) return null;

    return (<>
        <Tooltip>
            <TooltipTrigger
                render={<Button
                    type="button"
                    size={showTooltip ? "icon-sm" : "sm"}
                    variant={state.active ? "default" : "outline"}
                    disabled={state.disabled}
                    onClick={() => { config.panel ? setPanelOpen(true) : config.action(editor) }}
                    aria-label={config.label}
                    aria-pressed={state.active}
                    className={cn(config.className)}
                >
                    <Icon />
                    {!showTooltip && config.label}
                </Button>}
            />
            {showTooltip && (
                <TooltipContent side="bottom">{config.label}</TooltipContent>
            )}
        </Tooltip>
        {config.panel && <config.panel editor={editor} open={panelOpen} onOpenChange={setPanelOpen} />}
    </>);
}