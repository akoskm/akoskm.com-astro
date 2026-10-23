import type { APIRoute } from "astro";
import { SITE } from "@config";
import { getAllPosts } from "lib/getAllPosts";
import { resolveDescription } from "lib/postMeta";
import postFilter from "@utils/postFilter";
import getSortedPosts from "@utils/getSortedPosts";

export const GET: APIRoute = async () => {
  const posts = getSortedPosts((await getAllPosts()).filter(postFilter));

  const lines = [
    `# ${SITE.author}`,
    "",
    `> ${SITE.desc}`,
    "",
    "Ákos K (Akos Komuves) is a developer and author. The site is https://akoskm.com/. The Bitsy newsletter is https://akoskm.substack.com.",
    "",
    "## Posts",
    "",
    ...posts.map(post => {
      const url = `${SITE.website}${post.slug}/`;
      const description = resolveDescription(
        post.slug,
        post.seo?.description,
        post.brief
      );
      return `- [${post.title}](${url}): ${description}`;
    }),
    "",
    "## Site",
    "",
    `- [About](${SITE.website}about/): Software developer and author. Coding since 2005.`,
    `- [Posts](${SITE.website}posts/): Every article.`,
    `- [Books](${SITE.website}books/): React testing, hooks, generative AI, and PWA books and courses.`,
    `- [Portfolio](${SITE.website}portfolio/): Client project case studies.`,
    `- [Hire](${SITE.website}hire-me/): Consulting, contracting, and fractional CTO work.`,
    `- [Full text for agents](${SITE.website}llms-full.txt)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
