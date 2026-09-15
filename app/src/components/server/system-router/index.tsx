import { systemRouterSchema } from "@/lib/schema/system-router.schema";
import { isEmpty } from "@/lib/utils";
interface Props {
    route: string;
    sp?: Record<string, string>;
}

export function SystemRouter({ route, sp }: Props) {
    const hasSp = !isEmpty(sp);
    if (hasSp) {
        const parsedRoute = systemRouterSchema.safeParse(sp);
        if (!parsedRoute.success) {
            console.error(parsedRoute.error);
            return <div>Invalid route or search params</div>;
        }
    }
    return (
        <div>
            <h1>System Router</h1>
            <p>Route: {route}</p>
            {hasSp && <p>Search Params: {JSON.stringify(sp)}</p>}
        </div>
    )
}