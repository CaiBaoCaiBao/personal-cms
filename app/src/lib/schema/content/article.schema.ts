import { z } from "zod";
import {
    contentSchema,
    contentQuerySchema
 } from "./content.schema";

const coverImgId = z.string().trim().min(1).nullable().default(null);

export const articleSchema = z.discriminatedUnion("status", [
    contentSchema.options[0].extend({
        coverImgId
    }),
    contentSchema.options[1].extend({
        coverImgId
    })
]);

export const articleQuerySchema = contentQuerySchema.extend({})

export type ArticleDTO = z.output<typeof articleSchema>;
export type ArticleQueryDTO = z.output<typeof articleQuerySchema>;

