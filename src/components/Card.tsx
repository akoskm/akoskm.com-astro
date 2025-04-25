import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { Post } from "lib/schema";

export interface Props {
  post: Post;
}

export default function Card({
  post: { slug, title, publishedAt, updatedAt, seo },
}: Props) {
  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className:
      "text-lg font-medium decoration-dashed hover:underline text-priority",
  };

  return (
    <li className="my-6">
      <a
        href={`/${slug}/`}
        className="text-priority inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        <h3 {...headerProps}>{title}</h3>
      </a>
      <Datetime pubDatetime={publishedAt} modDatetime={updatedAt} />
      <p className="text-priority">{seo.description}</p>
    </li>
  );
}
