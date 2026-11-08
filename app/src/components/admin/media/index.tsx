"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export function AdminMedia() {
    return (
        <div>
            <Button
                nativeButton={false}
                render={<Link href="/admin/media/upload" />}
            >
                Upload
            </Button>
            AdminMedia
        </div>
    )
}