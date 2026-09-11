import { z } from "astro/zod";

export const blogSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  published: z.iso.date(),
  updated: z.iso.date().optional(),
  tags: z.array(z.string().min(1)).min(1),
  draft: z.boolean(),
});

export const blogId = (entry: string) => {
  const id = entry.replace(/\.md$/, "").split("/").at(-1)!;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Blog filename must be a lowercase, dash-separated ID: ${entry}`);
  }
  return id;
};
