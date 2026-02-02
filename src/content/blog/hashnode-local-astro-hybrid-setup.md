---
title: "Adding Local Markdown Posts to Your Hashnode-Powered Astro Blog"
publishedAt: "2026-02-01"
description: "Learn how to create a hybrid blog system in Astro that fetches posts from Hashnode's GraphQL API while also supporting local markdown files."
coverImage: "../../assets/covers/hashnode-local-astro-hybrid-setup.png"
tags:
  - name: "TypeScript"
    slug: "typescript"
  - name: "Astro"
    slug: "astro"
series: null
draft: false
---

Hashnode is dying, kind of.

The once beloved platform that encouraged me to write more and better will keep the lights on, but that's it, I'm afraid. No Discord anymore, no bug fixes—the founders are working on a new project (good luck btw!).

That said, the Hashnode team rolled out some amazing features, like their GraphQL API, which helped many devs launch their own blog templates and use Hashnode as a backend store and writing platform.

---

The recent happenings made me think: it's time to host local content outside of Hashnode, without redoing your blog.

The solution: a hybrid system that merges both sources, sorts everything by date, and renders posts identically regardless of origin.

Here's how I built it.

## The Problem

My existing setup used Hashnode's GraphQL API as the single source of truth. Every page called `fetchAllPosts()` to grab content. Simple, but limiting.

I wanted to:
- Write certain posts in local markdown
- Keep everything in version control
- Maintain the same rendering pipeline for both sources

The challenge is that Hashnode posts come with a specific shape—author info, reading time, table of contents, SEO metadata. Local posts need to match that shape exactly, or the templates break.

## Setting Up the Content Collection

First, create a content collection for local posts. Astro's content collections give you type safety and image optimization out of the box.

```typescript
// src/content/config.ts
import { defineCollection, z } from "astro:content";

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

export const collections = { blog };
```

The `image()` helper is key—it lets Astro optimize your cover images at build time. Tags mirror Hashnode's structure so they work with existing components.

## Building the Post Merger

The real work happens in a utility that fetches from both sources and normalizes everything into a common shape.

```typescript
// src/lib/getAllPosts.ts
import { getCollection } from "astro:content";
import { fetchAllPosts } from "./clients";
import type { Post } from "./schema";
import { SITE } from "@config";

export async function getAllPosts(): Promise<Post[]> {
  // Fetch from both sources
  const hashnodePosts = await fetchAllPosts();

  let localEntries = [];
  try {
    localEntries = await getCollection("blog");
  } catch {
    // Collection empty or doesn't exist yet
  }

  // Transform local posts to match Hashnode shape
  const localPosts: Post[] = await Promise.all(
    localEntries.map(async entry => {
      const { headings } = await entry.render();

      // Calculate reading time from raw content
      const wordCount = (entry.body || "").split(/\s+/).length;
      const readTimeInMinutes = Math.ceil(wordCount / 200);

      // Build TOC from headings
      const tableOfContentsItems = headings.map(h => ({
        id: h.slug,
        level: h.depth,
        title: h.text,
        slug: h.slug,
      }));

      // Handle cover image URL
      const coverImageUrl =
        typeof entry.data.coverImage === "string"
          ? entry.data.coverImage
          : entry.data.coverImage?.src || "";

      return {
        author: {
          name: SITE.author,
          profilePicture: "/assets/akoskm.jpg",
        },
        canonicalUrl: `${SITE.website}${entry.slug}/`,
        publishedAt: entry.data.publishedAt,
        updatedAt: entry.data.updatedAt || entry.data.publishedAt,
        title: entry.data.title,
        subtitle: "",
        brief: entry.data.description.slice(0, 160),
        slug: entry.slug,
        readTimeInMinutes,
        content: { html: "" },
        tags: entry.data.tags,
        series: entry.data.series || null,
        coverImage: { url: coverImageUrl },
        seo: { description: entry.data.description },
        features: {
          tableOfContents: { items: tableOfContentsItems },
        },
        draft: entry.data.draft,
        _localEntry: entry, // Keep reference for rendering
      };
    })
  );

  // Merge and sort by date
  const allPosts = [...hashnodePosts, ...localPosts];
  allPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return allPosts;
}
```

The `_localEntry` property is a trick—we store the original entry so we can render it later with Astro's content renderer.

## Fetching Individual Posts

For single post pages, we need a function that returns the full post plus the Content component for local posts:

```typescript
export async function getPostBySlug(slug: string) {
  const allPosts = await getAllPosts();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }

  // Local posts need their Content component
  if (post._localEntry) {
    const { Content } = await post._localEntry.render();
    return { ...post, _ContentComponent: Content };
  }

  // Hashnode posts fetch full details
  return await getPost(slug);
}
```

## Updating the Layout

The PostDetails layout needs to handle both content types. Hashnode posts come with pre-rendered HTML. Local posts need their Content component invoked.

```astro
---
// src/layouts/PostDetails.astro
const { post } = Astro.props;
const ContentComponent = post._ContentComponent;
---

<article>
  {ContentComponent
    ? <ContentComponent />
    : <Fragment set:html={content.html} />}
</article>
```

One gotcha: table of contents links. Hashnode uses `#heading-slug` format. Astro's content renderer uses `#slug`. Handle both:

```astro
<a href={ContentComponent ? `#${heading.slug}` : `#heading-${heading.slug}`}>
  {heading.title}
</a>
```

## Cover Image Paths

Local cover images need special handling. The image optimization gives you a processed path, but og:image tags need absolute URLs.

```typescript
// For display: use the path as-is
const displayImageUrl = ogImage?.url;

// For og:image: ensure absolute URL
const ogUrl = displayImageUrl.startsWith("http")
  ? displayImageUrl
  : `${SITE.website}${displayImageUrl.replace(/^\//, "")}`;
```

## Writing Your First Local Post

Create a markdown file in `src/content/blog/`:

```yaml
---
title: "Your Post Title"
publishedAt: "2026-02-01"
description: "A brief description for SEO"
coverImage: "../../assets/covers/your-cover.png"
tags:
  - name: "TypeScript"
    slug: "typescript"
series: null
draft: false
---

Your content here...
```

Put cover images in `src/assets/covers/`. Astro will optimize them automatically.

## Gotchas I Hit

**Series can be null.** Hashnode posts always have series info. Local posts might not. Make the field nullable in your schema.

**Reading time calculation.** Hashnode provides this. For local posts, count words and divide by 200.

**TOC format differences.** Mentioned above, but worth repeating—test both types of posts to catch link mismatches.

**Draft posts.** Add a `draft` field and filter them in production. Astro's content collections don't have built-in draft support like some other features.

**Code block styling.** Hashnode posts have inline styles for syntax highlighting. Local posts use Shiki, which sets CSS variables. If you're using Tailwind's `@layer base`, move Shiki's dark theme CSS outside the layer—otherwise inline styles win:

```css
/* Outside @layer for higher specificity over inline styles */
html[data-theme="dark"] pre.astro-code,
html[data-theme="dark"] pre.astro-code span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg, #011627) !important;
}
```

## Next Steps

- Add a `draft: true` filter to hide work-in-progress posts in production
- Create a [custom remark plugin](/writing-remark-plugin-reading-time-astro/) for more accurate reading time
- Set up image optimization presets for consistent cover image sizes
- Consider adding [MDX support](https://docs.astro.build/en/guides/integrations-guide/mdx/) for posts that need interactive components

## Code

See the full implementation in [this commit](https://github.com/akoskm/akoskm.com-astro/commit/a167275).
