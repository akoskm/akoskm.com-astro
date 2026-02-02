import rss from "@astrojs/rss";
import { getAllPosts } from "lib/getAllPosts";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";

export async function GET() {
  const posts = await getAllPosts();
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(post => ({
      link: `${post.slug}/`,
      title: post.title,
      description: post.seo?.description || post.brief || "",
      pubDate: new Date(post.updatedAt || post.publishedAt),
    })),
  });
}
