import { gql, GraphQLClient } from "graphql-request";
import type { AllPostsData, Post } from "./schema";
import { loadHashnodeSnapshot, normalizePost } from "./postMeta";

const HASHNODE_ENDPOINT = "https://gql-beta.hashnode.com";

export const getClient = () => {
  return new GraphQLClient(HASHNODE_ENDPOINT);
};

const myHashnodeURL = "akoskm.hashnode.dev";

const getPostsAtCursor = async (cursor = "") => {
  const client = getClient();

  const allPosts = await client.request<AllPostsData>(
    gql`
      query allPosts {
        publication(host: "${myHashnodeURL}") {
          id
          title
          posts(first: 10, after: "${cursor}") {
            pageInfo{
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                author{
                  name
                  profilePicture
                }
                title
                subtitle
                brief
                slug
                canonicalUrl
                coverImage {
                  url
                }
                tags {
                  name
                  slug
                }
                series {
                  name
                  slug
                }
                publishedAt
                updatedAt
                readTimeInMinutes
                content {
                  html
                }
                seo {
                  description
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `
  );

  return allPosts;
};

async function fetchHashnodePosts(): Promise<Post[]> {
  let cursor = "";
  let hasNextPage = true;
  const postList: Post[] = [];

  while (hasNextPage) {
    const data = await getPostsAtCursor(cursor);
    const publication = data?.publication;
    if (!publication) {
      throw new Error("Hashnode publication unavailable");
    }

    postList.push(
      ...publication.posts.edges.map(({ node }: { node: Post }) =>
        normalizePost(node)
      )
    );

    cursor = publication.posts.pageInfo.endCursor;
    hasNextPage = publication.posts.pageInfo.hasNextPage;
  }

  if (postList.length === 0) {
    throw new Error("Hashnode returned no posts");
  }

  return postList;
}

let cachedPosts: Promise<Post[]> | undefined;

export const fetchAllPosts = async (): Promise<Post[]> => {
  if (!cachedPosts) {
    cachedPosts = (async () => {
      try {
        return await fetchHashnodePosts();
      } catch (error) {
        const message = (
          error instanceof Error ? error.message : String(error)
        ).slice(0, 140);
        console.warn(
          `Hashnode API unavailable (${message}). Using src/data/hashnode-posts.json.`
        );
        return loadHashnodeSnapshot().map(post => normalizePost(post));
      }
    })();
  }

  return cachedPosts;
};

export const getPreviewPosts = async () => {
  const client = getClient();

  const allPosts = await client.request<AllPostsData>(
    gql`
      query allPosts {
        publication(host: "${myHashnodeURL}") {
          id
          title
          posts(first: 3) {
            pageInfo{
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                author{
                  name
                  profilePicture
                }
                title
                subtitle
                brief
                slug
                canonicalUrl
                coverImage {
                  url
                }
                tags {
                  name
                  slug
                }
                series {
                  name
                  slug
                }
                publishedAt
                updatedAt
                readTimeInMinutes
                content {
                  html
                }
                seo {
                  description
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `
  );

  return allPosts;
};

export const getPost = async (slug: string) => {
  const posts = await fetchAllPosts();
  const post = posts.find(item => item.slug === slug);
  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }
  return post;
};
