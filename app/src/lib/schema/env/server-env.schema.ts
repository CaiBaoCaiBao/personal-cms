import { z } from "zod";

export const serverEnvSchema = z.object({
    DATABASE_URL: z.url().min(1),
    ENV: z.enum(["development", "production", "test"]),
}).transform((val) => {
    return {
        node: {
            env: val.ENV,
            isPro: val.ENV === "production",
        },
        dataSource: {
            url: val.DATABASE_URL,
        },
    };
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;