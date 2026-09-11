import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { blogId, blogSchema } from "./lib/content-schema";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md", generateId: ({ entry }) => blogId(entry) }),
  schema: blogSchema,
});

export { blogSchema };
export const collections = { blog };
