import "server-only";
import { z } from "zod";

export const serverEnvSchema = z.object({
    databaseUrl: z.url(),
    nodeEnv: z.enum(["development", "production", "test"]),
    appName: z.string().min(1),
}).transform((data) => ({
    appName: data.appName,
    datasource: {
        url: data.databaseUrl
    },
    env: {
        nodeEnv: data.nodeEnv,
        isPro: data.nodeEnv === "production",
    }
}));

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = serverEnvSchema.parse({
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    appName: process.env.APP_NAME,
});