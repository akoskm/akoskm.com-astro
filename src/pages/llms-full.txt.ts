import type { APIRoute } from "astro";
import { SITE } from "@config";
import { getAllPosts } from "lib/getAllPosts";
import { plainTextFromHtml, resolveDescription, toIso } from "lib/postMeta";
import postFilter from "@utils/postFilter";
import getSortedPosts from "@utils/getSortedPosts";
import type { Post } from "lib/schema";

function bodyFor(post: Post & { _localEntry?: { body?: string } }): string {
  const markdown = post._localEntry?.body?.trim();
  if (markdown) return markdown;
  return plainTextFromHtml(post.content?.html || "");
}

export const GET: APIRoute = async () => {
  const posts = getSortedPosts((await getAllPosts()).filter(postFilter));

  const sections = posts.map(post => {
    const url = `${SITE.website}${post.slug}/`;
    const description = resolveDescription(
      post.slug,
      post.seo?.description,
      post.brief
    );
    const tags = post.tags.map(tag => tag.name).join(", ");
    return [
      `# ${post.title}`,
      "",
      `URL: ${url}`,
      `Published: ${toIso(post.publishedAt) || post.publishedAt}`,
      `Updated: ${toIso(post.updatedAt) || post.updatedAt}`,
      tags ? `Tags: ${tags}` : "",
      "",
      description,
      "",
      bodyFor(post),
    ]
      .filter(line => line !== "")
      .join("\n");
  });

  const text = [
    `# ${SITE.author}`,
    "",
    `> ${SITE.desc}`,
    "",
    "Full text of posts on https://akoskm.com/. A shorter index is at https://akoskm.com/llms.txt.",
    "",
    sections.join("\n\n---\n\n"),
    "",
  ].join("\n");

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
