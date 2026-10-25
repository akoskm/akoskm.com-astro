import { getCollection } from "astro:content";
import type { Post } from "./schema";
import { AUTHOR_IMAGE, SITE } from "@config";

export async function getAllPosts(): Promise<Post[]> {
  const localEntries = await getCollection("blog");

  const localPosts: Post[] = await Promise.all(
    localEntries.map(async entry => {
      const { headings } = await entry.render();

      const wordCount = (entry.body || "").split(/\s+/).length;
      const readTimeInMinutes =
        entry.data.readTimeInMinutes || Math.ceil(wordCount / 200);

      const tableOfContentsItems = headings.map(h => ({
        id: h.slug,
        level: h.depth,
        title: h.text,
        slug: h.slug,
      }));

      const cover = entry.data.coverImage;
      const coverImageUrl = !cover
        ? ""
        : typeof cover === "string"
          ? cover
          : cover.src || "";

      const description = entry.data.description;

      return {
        author: {
          name: SITE.author,
          profilePicture: AUTHOR_IMAGE,
        },
        canonicalUrl:
          entry.data.canonicalUrl || `${SITE.website}${entry.slug}/`,
        publishedAt: entry.data.publishedAt,
        updatedAt: entry.data.updatedAt || entry.data.publishedAt,
        title: entry.data.title,
        subtitle: entry.data.subtitle || "",
        brief: entry.data.brief || description.slice(0, 160),
        slug: entry.slug,
        readTimeInMinutes,
        content: {
          html: "",
        },
        tags: entry.data.tags,
        series: entry.data.series || null,
        coverImage: {
          url: coverImageUrl,
        },
        coverAlt: entry.data.coverAlt,
        seo: {
          description,
        },
        features: {
          tableOfContents: {
            items: tableOfContentsItems,
          },
        },
        draft: entry.data.draft,
        faq: entry.data.faq,
        _localEntry: entry,
      } as Post & { _localEntry?: typeof entry };
    })
  );

  localPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return localPosts;
}

type ContentComponent = (props?: Record<string, never>) => unknown;

type LocalEntry = {
  render: () => Promise<{ Content: ContentComponent }>;
};

export type PostWithContent = Post & {
  _localEntry?: LocalEntry;
  _ContentComponent?: ContentComponent;
};

export async function getPostBySlug(slug: string): Promise<PostWithContent> {
  const allPosts = await getAllPosts();
  const post = allPosts.find(p => p.slug === slug) as
    | PostWithContent
    | undefined;

  if (!post?._localEntry) {
    throw new Error(`Post not found: ${slug}`);
  }

  const { Content } = await post._localEntry.render();

  return {
    ...post,
    _ContentComponent: Content,
  };
}
