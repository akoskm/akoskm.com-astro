import { z } from "astro/zod";

export const TagSchema = z.object({
  name: z.string(),
  slug: z.string(),
});
export const SerieSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const PostSchema = z.object({
  author: z.object({
    name: z.string(),
    profilePicture: z.string(),
  }),
  canonicalUrl: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string(),
  title: z.string(),
  subtitle: z.string(),
  brief: z.string(),
  slug: z.string(),
  readTimeInMinutes: z.number(),
  content: z.object({
    html: z.string(),
  }),
  tags: z.array(TagSchema),
  series: SerieSchema.nullable().optional(),
  coverImage: z.object({
    url: z.string(),
  }),
  seo: z.object({
    description: z.string(),
  }),
  features: z.object({
    tableOfContents: z.object({
      items: z.array(
        z.object({
          id: z.string(),
          level: z.number(),
          title: z.string(),
          slug: z.string(),
        })
      ),
    }),
  }),
  draft: z.boolean().optional(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
});

export const PageInfo = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string(),
});

export type PageInfo = z.infer<typeof PageInfo>;
export type Post = z.infer<typeof PostSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Serie = z.infer<typeof SerieSchema>;
