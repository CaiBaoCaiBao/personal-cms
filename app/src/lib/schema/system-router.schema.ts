import { z } from "zod";

export const systemRouterSchema = z.object({
  page: z.string(),
});

export type SystemRouterQueryDTO = z.infer<typeof systemRouterSchema>;