import type { APIRoute } from "astro";
import { SITE } from "@config";
import { BITSY_TAGLINE } from "@data/promos";
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
    `${SITE.author} is a developer and author. The site is https://akoskm.com/. Bitsy (https://akoskm.substack.com): ${BITSY_TAGLINE}`,
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
    `- [Newsletter](${SITE.website}newsletter/): ${BITSY_TAGLINE}`,
    `- [Apps](${SITE.website}apps/): Nummy, SubSub, Geordi Scan, and One Task X.`,
    `- [Nummy](${SITE.website}apps/nummy/): Nursing tracker. Log a feed on your Watch, then see the week on iPhone.`,
    `- [SubSub](${SITE.website}apps/subsub/): Subscription tracker for iPhone and Mac. No bank login.`,
    `- [Geordi Scan](https://geordiscan.com): See what your documents hide. Upload contracts and legal documents and get scenario flowcharts, key dates, and obligations, each linked to the page and quote in the PDF. EU-hosted storage.`,
    `- [One Task X](https://onetaskx.com): A minimalist todo application.`,
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
