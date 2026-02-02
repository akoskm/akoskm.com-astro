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

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      publishedAt: z.string(),
      updatedAt: z.string().optional(),
      description: z.string(),
      coverImage: image(),
      tags: z.array(z.object({ name: z.string(), slug: z.string() })),
      series: z
        .object({ name: z.string(), slug: z.string() })
        .nullable()
        .optional(),
      draft: z.boolean().optional().default(false),
    }),
});

export const collections = { portfolio, blog };
