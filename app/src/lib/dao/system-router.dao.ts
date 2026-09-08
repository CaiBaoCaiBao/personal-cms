import "server-only";
import { db } from "@/prisma/db";
import { AppError } from "../utils";
import { mapPrismaError } from "../utils/server";

type InputSystemRouter = {
    
}

export class SystemRouterDao {
    static async getRouterList() {
        try {
            await db.orm.public.SystemRouter.create({
                data:{}
            })
        } catch (e) {
            if (e instanceof AppError) throw e;
            throw mapPrismaError(e);
        }
    }
}