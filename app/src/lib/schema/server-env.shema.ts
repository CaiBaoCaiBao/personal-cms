import "server-only";
import { z } from "zod";

const serverEnvSchema = z
    .object({
        DATABASE_URL: z.url(),
        NODE_ENV: z.enum(["development", "production", "test"]),
        APP_NAME: z.string().min(1),
        // DEEPL_API_KEY: z.string().min(1),
        // QINIU_ACCESS_KEY: z.string().min(1),
        // QINIU_SECRET_KEY: z.string().min(1),
        // QINIU_BUCKET: z.string().min(1),
        // QINIU_URL: z.url(),
        // JWT_SECRET: z.string().min(1),
        // JWT_EXPIRES_IN: z.coerce.number().min(1),
        // AUTH_SECRET: z.string().min(1),
        // AUTH_TRUST_HOST: z
        //     .enum(["true", "false"])
        //     .transform((v) => v === "true"),
    })
    .transform((data) => ({
        appName: data.APP_NAME,
        datasource: {
            url: data.DATABASE_URL,
        },
        env: {
            nodeEnv: data.NODE_ENV,
            isPro: data.NODE_ENV === "production",
        },
        // key: {
        //     deepL: data.DEEPL_API_KEY,
        // },
        // qiniu: {
        //     key: {
        //         accessKey: data.QINIU_ACCESS_KEY,
        //         secretKey: data.QINIU_SECRET_KEY,
        //     },
        //     bucket: data.QINIU_BUCKET,
        //     url: data.QINIU_URL,
        // },
        // jwt: {
        //     secret: data.JWT_SECRET,
        //     expiresIn: data.JWT_EXPIRES_IN,
        // },
        // auth: {
        //     secret: data.AUTH_SECRET,
        //     trustHost: data.AUTH_TRUST_HOST,
        // },
    }));

export const serverEnv = serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    APP_NAME: process.env.APP_NAME,
    // DEEPL_API_KEY: process.env.DEEPL_API_KEY,
    // QINIU_ACCESS_KEY: process.env.QINIU_ACCESS_KEY,
    // QINIU_SECRET_KEY: process.env.QINIU_SECRET_KEY,
    // QINIU_BUCKET: process.env.QINIU_BUCKET,
    // QINIU_URL: process.env.QINIU_URL,
    // JWT_SECRET: process.env.JWT_SECRET,
    // JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    // AUTH_SECRET: process.env.AUTH_SECRET,
    // AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;