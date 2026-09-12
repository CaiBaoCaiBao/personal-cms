"use client";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

function SubmitActions({
    form,
    formId,
    isEdit,
}: {
    form: EditForm;
    formId: string;
    isEdit: boolean;
}) {
    return (
        <form.Subscribe
            selector={(state) =>
                [state.canSubmit, state.isSubmitting, state.errorMap.onSubmit] as const
            }
        >
            {([canSubmit, isSubmitting, submitError]) => (
                <>
                    {submitError ? (
                        <p className="w-full text-sm text-destructive">
                            {typeof submitError === "string"
                                ? submitError
                                : submitError instanceof Error
                                    ? submitError.message
                                    : "提交失败，请稍后重试"}
                        </p>
                    ) : null}
                    <Button
                        type="submit"
                        form={formId}
                        disabled={!canSubmit || isSubmitting}
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
                    <DialogClose
                        disabled={isSubmitting}
                        render={
                            <Button variant="outline" disabled={isSubmitting}>
                                取消
                            </Button>
                        }
                    />
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
    const title = useMemo(() => {
        if (tag) {
            return `编辑标签：${tag.name}`;
        }
        return "新建标签";
    }, [tag]);

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <EditTagForm form={form} formId={formId} />
                    <DialogFooter>
                        <SubmitActions form={form} formId={formId} isEdit={Boolean(tag)} />
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
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                </DrawerHeader>
                <EditTagForm form={form} formId={formId} />
                <DrawerFooter>
                    <form.Subscribe
                        selector={(state) =>
                            [
                                state.canSubmit,
                                state.isSubmitting,
                                state.errorMap.onSubmit,
                            ] as const
                        }
                    >
                        {([canSubmit, isSubmitting, submitError]) => (
                            <>
                                {submitError ? (
                                    <p className="text-sm text-destructive">
                                        {typeof submitError === "string"
                                            ? submitError
                                            : submitError instanceof Error
                                                ? submitError.message
                                                : "提交失败，请稍后重试"}
                                    </p>
                                ) : null}
                                <Button
                                    type="submit"
                                    form={formId}
                                    disabled={!canSubmit || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner />
                                            提交中...
                                        </>
                                    ) : tag ? (
                                        "保存"
                                    ) : (
                                        "创建"
                                    )}
                                </Button>
                                <DrawerClose
                                    disabled={isSubmitting}
                                    render={
                                        <Button variant="outline" disabled={isSubmitting}>
                                            取消
                                        </Button>
                                    }
                                />
                            </>
                        )}
                    </form.Subscribe>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
