"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DropdownMenuConfig } from "@/type/editor.type";
import { Button } from "@/components/ui/button";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { ChevronDown } from "lucide-react";

interface Props {
  config: DropdownMenuConfig;
  showTooltip?: boolean;
}

export function MenuDropdown({ config, showTooltip = true }: Props) {
  const { editor } = useTiptap();

  const { items, isActive, ActiveIcon } = useTiptapState(({ editor }) => {
    const items = config.items.map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      active: item.isActive(editor),
      disabled: item.disabled(editor),
      action: item.action,
    }));
    const active = items.find((i) => i.active);
    return {
      items,
      isActive: !!active,
      ActiveIcon: active?.icon ?? config.icon,
    };
  });

  if (!editor) return null;

  const trigger = (
    <DropdownMenuTrigger
      render={
        <Button
          type="button"
          size="sm"
          variant={isActive ? "default" : "outline"}
          aria-label={config.label}
        >
          <ActiveIcon />
          <ChevronDown />
          {!showTooltip && config.label}
        </Button>
      }
    />
  );

  return (
    <DropdownMenu>
      {showTooltip ? (
        <Tooltip>
          <TooltipTrigger render={trigger} />
          <TooltipContent side="bottom">{config.label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}

      <DropdownMenuContent>
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem
              key={item.id}
              disabled={item.disabled}
              onClick={() => item.action(editor)}
            >
              <ItemIcon />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}