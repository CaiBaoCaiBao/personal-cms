"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string | React.ReactNode;
    description?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

export function ResponsiveDialogDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
}: Props) {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    {children}
                    {footer && <DialogFooter>{footer}</DialogFooter>}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            showSwipeHandle={isMobile}
            swipeDirection="down"
        >
            <DrawerContent>
                <DrawerHeader>
                    {title && <DrawerTitle>{title}</DrawerTitle>}
                    {description && <DrawerDescription>{description}</DrawerDescription>}
                </DrawerHeader>
                <div className="px-4 my-4">
                    {children}
                </div>
                {footer && <DrawerFooter>{footer}</DrawerFooter>}
            </DrawerContent>
        </Drawer>
    )

}