import { apiHandler } from "@/lib/utils/server";
import { SystemRouterService } from "@/lib/service/system-router.service";

export const GET = apiHandler(async () => {
    const data = await SystemRouterService.getSidebarNav();
    return {
        ok: true,
        data,
        timestamp: new Date().toISOString(),
    };
});
