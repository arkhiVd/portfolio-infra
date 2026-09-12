import { z } from "astro/zod";

// Git-backed form editors serialize a cleared optional date as an empty string.
const optionalDate = z.preprocess((value) => (value === "" ? undefined : value), z.iso.date().optional());

export const blogSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  published: z.iso.date(),
  updated: optionalDate,
  tags: z.array(z.string().min(1)).min(1),
  draft: z.boolean(),
});

export const referenceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  reviewed: z.iso.date(),
  draft: z.boolean(),
});

export const referenceId = (entry: string) => {
  const id = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.exec(entry)?.[1];
  if (id !== "homelab" && id !== "how-i-work") {
    throw new Error(`Reference filename must be homelab or how-i-work: ${entry}`);
  }
  return id;
};

export const blogId = (entry: string) => {
  const id = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.exec(entry)?.[1];
  if (!id) {
    throw new Error(`Blog filename must be a lowercase, dash-separated ID: ${entry}`);
  }
  return id;
};
