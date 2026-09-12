import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
    return <div>
        <Button
            nativeButton={false}
            render={<Link href="/admin/lab/editor"/>}
        >
            Editor-Lab
        </Button>
    </div>;
};