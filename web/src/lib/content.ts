import { getCollection, type CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

export const isPublished = (post: BlogPost) =>
  !post.data.draft && post.data.published <= new Date().toISOString().slice(0, 10);

export const getPublishedBlogPosts = async (): Promise<BlogPost[]> =>
  (await getCollection("blog", isPublished)).sort((a, b) =>
    b.data.published.localeCompare(a.data.published),
  );
