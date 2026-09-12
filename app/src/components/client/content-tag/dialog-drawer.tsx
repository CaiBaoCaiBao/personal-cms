"use client";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemo } from "react";
import { ContentTagItemVO } from "@/type/content-tag.type";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EditForm } from "@/hooks/content-tag/use-edit-form";
import { EditTagForm } from "./edit-tag-form";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tag: ContentTagItemVO | null;
    formId: string;
    form: EditForm;
}

function SubmitError({ error }: { error: unknown }) {
    if (!error) return null;
    const message =
        typeof error === "string"
            ? error
            : error instanceof Error
                ? error.message
                : "提交失败，请稍后重试";
    return (
        <p className="w-full text-sm text-destructive sm:mr-auto sm:self-center">
            {message}
        </p>
    );
}

function SubmitActions({
    form,
    formId,
    isEdit,
    Close,
}: {
    form: EditForm;
    formId: string;
    isEdit: boolean;
    Close: typeof DialogClose | typeof DrawerClose;
}) {
    return (
        <form.Subscribe
            selector={(state) =>
                [state.canSubmit, state.isSubmitting, state.errorMap.onSubmit] as const
            }
        >
            {([canSubmit, isSubmitting, submitError]) => (
                <>
                    <SubmitError error={submitError} />
                    <Close
                        disabled={isSubmitting}
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                取消
                            </Button>
                        }
                    />
                    <Button
                        type="submit"
                        form={formId}
                        size="sm"
                        disabled={!canSubmit || isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner />
                                提交中...
                            </>
                        ) : isEdit ? (
                            "保存"
                        ) : (
                            "创建"
                        )}
                    </Button>
                </>
            )}
        </form.Subscribe>
    );
}

export function DialogDrawer({
    open,
    onOpenChange,
    tag,
    formId,
    form,
}: Props) {
    const isMobile = useIsMobile();
    const isEdit = Boolean(tag);
    const title = useMemo(() => {
        if (tag) return `编辑标签`;
        return "新建标签";
    }, [tag]);
    const description = tag
        ? `正在修改「${tag.name}」`
        : "填写名称与标识，标识用于文章筛选与 URL";

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
                    <DialogHeader className="border-b px-4 py-3">
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-4 py-4">
                        <EditTagForm form={form} formId={formId} />
                    </div>
                    <DialogFooter className="mx-0 mb-0 flex-col rounded-none sm:flex-row">
                        <SubmitActions
                            form={form}
                            formId={formId}
                            isEdit={isEdit}
                            Close={DialogClose}
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            showSwipeHandle
        >
            <DrawerContent>
                <DrawerHeader className="border-b pb-3 text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                    <EditTagForm form={form} formId={formId} />
                </div>
                <DrawerFooter className="border-t bg-muted/40 pt-3">
                    <SubmitActions
                        form={form}
                        formId={formId}
                        isEdit={isEdit}
                        Close={DrawerClose}
                    />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
