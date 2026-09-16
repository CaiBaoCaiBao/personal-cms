import { z } from "zod";

export const serverEnvSchema = z.object({
    appName: z.string().min(1),
    nodeEnv: z.enum(["development", "production", "test"]),
    isPro: z.boolean(),
}).transform((data) => ({
    appName: data.appName,
    env: {
        nodeEnv: data.nodeEnv,
        isPro: data.isPro,
    }
}))

export type ServerEnvSchema = z.infer<typeof serverEnvSchema>;

export const serverEnv = serverEnvSchema.parse({
    appName: process.env.APP_NAME,
    nodeEnv: process.env.NODE_ENV,
    isPro: process.env.NODE_ENV === "production",
});