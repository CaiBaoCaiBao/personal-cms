
import { isEmpty } from "@/lib/utils";
import { notFound } from "next/navigation";

interface Props {
    route: string;
    sp?: Record<string, string>;
}

export function SystemPage({ route, sp }: Props) {
    const hasSp = !isEmpty(sp);
    if (hasSp) {
        return notFound();
    }
    return (
        <div>
            <h1>System Page</h1>
            <p>Route: {route}</p>
            {hasSp && <p>Search Params: {JSON.stringify(sp)}</p>}
        </div>
    )
}