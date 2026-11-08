import { AdminMediaUpload } from "@/components/admin/media/upload";
import { AdminHeaderSlot } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
export default function Page() {
    return (<>
        <AdminHeaderSlot>
            <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/admin/media" />}
            >
                <MoveLeft />Back
            </Button>
        </AdminHeaderSlot>
        <AdminMediaUpload />
    </>)

}