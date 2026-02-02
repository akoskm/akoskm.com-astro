import { getCollection } from "astro:content";
import { fetchAllPosts, getPost } from "./clients";
import type { Post } from "./schema";
import { SITE } from "@config";

export async function getAllPosts(): Promise<Post[]> {
  let localEntries: Awaited<ReturnType<typeof getCollection<"blog">>> = [];
  try {
    localEntries = await getCollection("blog");
  } catch {
    // Collection empty or doesn't exist yet
  }

  const hashnodePosts = await fetchAllPosts();

  const localPosts: Post[] = await Promise.all(
    localEntries.map(async entry => {
      const { headings } = await entry.render();

      // Calculate reading time from raw content
      const wordCount = (entry.body || "").split(/\s+/).length;
      const readTimeInMinutes = Math.ceil(wordCount / 200);

      // Extract TOC from headings
      const tableOfContentsItems = headings.map(h => ({
        id: h.slug,
        level: h.depth,
        title: h.text,
        slug: h.slug,
      }));

      // Get cover image URL - for local images, we need the src
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
        content: {
          html: "", // Will be populated when rendering
        },
        tags: entry.data.tags,
        series: entry.data.series || null,
        coverImage: {
          url: coverImageUrl,
        },
        seo: {
          description: entry.data.description,
        },
        features: {
          tableOfContents: {
            items: tableOfContentsItems,
          },
        },
        draft: entry.data.draft,
        // Store render function for later use
        _localEntry: entry,
      } as Post & { _localEntry?: typeof entry };
    })
  );

  const allPosts = [...hashnodePosts, ...localPosts];

  // Sort by publishedAt desc
  allPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return allPosts;
}

export async function getPostBySlug(
  slug: string
): Promise<Post & { _localEntry?: any; _ContentComponent?: any }> {
  const allPosts = await getAllPosts();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }

  // If local post, render the content
  if ((post as any)._localEntry) {
    const entry = (post as any)._localEntry;
    const { Content } = await entry.render();

    return {
      ...post,
      _ContentComponent: Content,
    } as Post & { _localEntry?: any; _ContentComponent?: any };
  }

  // For Hashnode posts, fetch full details (including tableOfContents)
  return await getPost(slug);
}
