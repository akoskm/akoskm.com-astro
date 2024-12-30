import postFilter from "./postFilter";
import type { Post } from "lib/schema";

const getSortedPosts = (posts: Post[]) => {
  return posts.filter(postFilter);
};

export default getSortedPosts;
