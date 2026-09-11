import { getCollection, getEntry, type CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;
export type Reference = CollectionEntry<"reference">;

export const isPublished = (post: BlogPost) =>
  !post.data.draft && post.data.published <= new Date().toISOString().slice(0, 10);

export const getPublishedBlogPosts = async (): Promise<BlogPost[]> =>
  (await getCollection("blog", isPublished)).sort((a, b) =>
    b.data.published.localeCompare(a.data.published),
  );

export const isPublishedReference = (entry: Reference) =>
  !entry.data.draft && entry.data.reviewed <= new Date().toISOString().slice(0, 10);

export const getPublishedReferences = async (): Promise<Reference[]> =>
  (await getCollection("reference", isPublishedReference)).sort((a, b) =>
    b.data.reviewed.localeCompare(a.data.reviewed),
  );

export type HomePage = Extract<CollectionEntry<"page">["data"], { id: "home" }>;
export type AboutPage = Extract<CollectionEntry<"page">["data"], { id: "about" }>;

export const getHomePage = async (): Promise<HomePage> =>
  (await getEntry("page", "home"))!.data as HomePage;
export const getAboutPage = async (): Promise<AboutPage> =>
  (await getEntry("page", "about"))!.data as AboutPage;
