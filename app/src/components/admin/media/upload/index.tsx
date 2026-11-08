"use client";
import { useFileUpload } from "@/hooks/use-file-upload";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { stopEventBubble } from "@/lib/utils";
import {
    Upload,
    X,
    LayoutGrid,
    LayoutList,
} from "lucide-react";
import { ViewMode } from "@/types/globals.type";
import { GridData } from "./grid-data";
import { ListData } from "./list-data";

export function AdminMediaUpload() {
    const [errors, setErrors] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [state, actions] = useFileUpload({
        multiple: true,
        auto: false,
        maxSize: 1024 * 1024 * 2, // 2MB
        onError: (errors) => {
            setErrors(errors);
        }
    });
    const toggleViewMode = () => {
        setViewMode(viewMode === "grid" ? "list" : "grid");
    }
    const errorOrUploadButton = (errors.length > 0 ? (
        <>
            {errors.map((error, errorIndex) => (
                <p key={errorIndex} className="text-sm text-red-500">
                    {error}
                </p>
            ))}
            <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                    stopEventBubble(e);
                    actions.clearErrors();
                }}
                className="mt-2"
            >
                Clear Errors
            </Button>
        </>
    ) : (
        <Button
            size="sm"
            onClick={(e) => {
                stopEventBubble(e);
                actions.handleFilesAdded(state.files);
            }}
            disabled={state.files.length === 0 || state.isDragging}
        >
            <Upload />Upload
        </Button>
    ))
    return (
        <>
            <FileUpload
                getInputProps={actions.getInputProps}
                handleOpenDialog={actions.handleOpenDialog}
                handleDragOver={actions.handleDragOver}
                handleDragLeave={actions.handleDragLeave}
                handleDragEnter={actions.handleDragEnter}
                handleDrop={actions.handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-md p-4"
            >
                <div className="flex flex-col items-center justify-center text-center min-h-48">
                    <p className="sm:text-lg text-gray-500">
                        Click or drag and drop files here
                    </p>
                    <div className="mt-4">
                        {errorOrUploadButton}
                    </div>
                </div>
            </FileUpload>
            <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                    <Button variant="destructive" disabled={state.files.length === 0} size="sm" onClick={() => actions.clearFiles()}>
                        Clear All
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={toggleViewMode}>
                        {viewMode === "grid" ? <LayoutGrid /> : <LayoutList />}
                    </Button>
                </div>
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {state.files.map((item) => (
                            <GridData
                                key={item.id}
                                item={item}
                                onRemove={() => actions.removeFile(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {state.files.map((item) => (
                            <ListData
                                key={item.id}
                                item={item}
                                onRemove={() => actions.removeFile(item.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}