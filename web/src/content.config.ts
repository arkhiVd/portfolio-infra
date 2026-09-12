import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  blogId,
  blogSchema,
  pageId,
  pageSchema,
  projectId,
  projectSchema,
  referenceId,
  referenceSchema,
} from "./lib/content-schema";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md", generateId: ({ entry }) => blogId(entry) }),
  schema: blogSchema,
});
const reference = defineCollection({
  loader: glob({ base: "./src/content/reference", pattern: "**/*.md", generateId: ({ entry }) => referenceId(entry) }),
  schema: referenceSchema,
});
const page = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.json", generateId: ({ entry }) => pageId(entry) }),
  schema: pageSchema,
});
const project = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md", generateId: ({ entry }) => projectId(entry) }),
  schema: projectSchema,
});

export { blogSchema };
export const collections = { blog, page, project, reference };
