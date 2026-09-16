import "server-only";
import { db } from "@/prisma/db";
import type { SaveSystemRouterPO } from "@/type/system-router.type";
import { mapPrismaError } from "@/lib/utils/server";
import { AppError } from "@/lib/utils";

export class SystemRouterDao {

    static async insert(po: SaveSystemRouterPO) {
        try {
            await db.orm.public.SystemRouter.create(po);
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

    static async findByPath(path: string ) {
        try {
            const row = await db.orm.public.SystemRouter.where({
                path: path,
                removedAt: null,
            }).first();
            return row;
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }

}