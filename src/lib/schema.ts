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
});

export const PageInfo = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string(),
});

export const AllPostsDataSchema = z.object({
  publication: z.object({
    title: z.string(),
    posts: z.object({
      pageInfo: PageInfo,
      edges: z.array(
        z.object({
          node: PostSchema,
        })
      ),
    }),
  }),
});

export const PostDataSchema = z.object({
  publication: z.object({
    title: z.string(),
    post: PostSchema,
  }),
});

export type PageInfo = z.infer<typeof PageInfo>;
export type Post = z.infer<typeof PostSchema>;
export type AllPostsData = z.infer<typeof AllPostsDataSchema>;
export type PostData = z.infer<typeof PostDataSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Serie = z.infer<typeof SerieSchema>;
