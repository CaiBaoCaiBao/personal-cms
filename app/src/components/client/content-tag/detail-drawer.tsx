"use client";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import type { ContentTagItemVO } from "@/type/content-tag.type";
import { useIsMobile } from "@/hooks/use-mobile";
import { Spinner } from "@/components/ui/spinner";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";

interface Props {
    row: ContentTagItemVO | null;
    open: boolean;
    pending?: boolean;
    error?: string | null;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

export function DetailDrawer({
    row,
    open,
    pending = false,
    error,
    onOpenChange,
    onDelete,
}: Props) {
    const isMobile = useIsMobile();
    if (!row) return null;

    return (
        <Drawer
            open={open}
            onOpenChange={(nextOpen) => {
                if (pending && !nextOpen) return;
                onOpenChange(nextOpen);
            }}
            showSwipeHandle={isMobile}
            swipeDirection={isMobile ? "down" : "right"}
        >
            <DrawerContent>
                <DrawerHeader className="space-y-2">
                    <Item variant="outline" size="sm">
                        <ItemContent>
                            <ItemTitle className="flex w-full max-w-full items-center justify-between gap-2">
                                <span className="truncate">{row.name}</span>
                                <Badge
                                    variant={row.isActive ? "default" : "outline"}
                                    className="shrink-0 text-[10px] font-normal"
                                >
                                    {row.isActive ? "启用" : "停用"}
                                </Badge>
                            </ItemTitle>
                            <ItemDescription className="truncate font-mono text-[11px]">
                                {row.slug}
                            </ItemDescription>
                        </ItemContent>
                    </Item>
                    <DrawerDescription>
                        删除标签操作是不可逆的，请谨慎操作。
                    </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-3 px-4 py-3">
                    <section className="space-y-1">
                        <Label >Description:</Label>
                        <div className="text-muted-foreground text-sm">
                            {row.description ?
                                <span>
                                    {row.description}
                                </span> :
                                <span>The tag description is not set.</span>
                            }
                        </div>
                    </section>
                </div>

                {error ? (
                    <p className="px-4 text-sm text-destructive">{error}</p>
                ) : null}
                <DrawerFooter>
                    <Button
                        variant="destructive"
                        disabled={pending}
                        onClick={onDelete}
                    >
                        {pending ? (
                            <>
                                <Spinner /> Detailing...
                            </>
                        ) : (
                            <>
                                <Trash2 /> Detail
                            </>
                        )}
                    </Button>
                    <DrawerClose
                        render={
                            <Button variant="outline" disabled={pending}>
                                Cancel
                            </Button>
                        }
                    />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
