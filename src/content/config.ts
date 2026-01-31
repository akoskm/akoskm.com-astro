import { defineCollection, z } from "astro:content";

const portfolio = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    client: z.string(),
    clientUrl: z.string().optional(),
    description: z.string(),
    technologies: z.array(z.string()),
    results: z.array(z.string()),
  }),
});

export const collections = { portfolio };
