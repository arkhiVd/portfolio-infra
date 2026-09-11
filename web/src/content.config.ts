import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { blogId, blogSchema, referenceId, referenceSchema } from "./lib/content-schema";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md", generateId: ({ entry }) => blogId(entry) }),
  schema: blogSchema,
});
const reference = defineCollection({
  loader: glob({ base: "./src/content/reference", pattern: "**/*.md", generateId: ({ entry }) => referenceId(entry) }),
  schema: referenceSchema,
});

export { blogSchema };
export const collections = { blog, reference };
