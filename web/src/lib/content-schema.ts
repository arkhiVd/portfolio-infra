import { z } from "astro/zod";

// YAML parses an unquoted date into a Date object. The browser editor writes
// datetime fields unquoted, so normalize to YYYY-MM-DD before ISO validation.
// Date-only timestamps parse as UTC midnight, so the UTC slice round-trips.
const yamlDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.iso.date(),
);

// Git-backed form editors serialize a cleared optional date as an empty string.
const optionalDate = z.preprocess((value) => (value === "" ? undefined : value), yamlDate.optional());

export const blogSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  published: yamlDate,
  updated: optionalDate,
  tags: z.array(z.string().min(1)).min(1),
  draft: z.boolean(),
});

export const referenceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  reviewed: yamlDate,
  draft: z.boolean(),
});

const nonEmpty = z.string().min(1);
const httpsUrl = z.url().refine((value) => value.startsWith("https://"), "URL must use HTTPS");
const publicAsset = z.string().regex(/^\/assets\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/, "Image must be an /assets/ path");

const roleSchema = z.object({
  title: nonEmpty,
  org: nonEmpty,
  period: nonEmpty,
  location: nonEmpty,
  points: z.array(nonEmpty).min(1),
});

export const pageSchema = z.discriminatedUnion("id", [
  z.object({
    id: z.literal("home"),
    hero: z.object({ role: nonEmpty, introduction: nonEmpty }),
    discover: z.object({
      blog: z.object({ title: nonEmpty, description: nonEmpty }),
      homelab: z.object({ title: nonEmpty, description: nonEmpty }),
      workflow: z.object({ title: nonEmpty, description: nonEmpty }),
    }),
    about: nonEmpty,
  }),
  z.object({
    id: z.literal("about"),
    introduction: nonEmpty,
    experience: z.array(roleSchema).min(1),
    certifications: z.array(z.object({ name: nonEmpty, issuer: nonEmpty, verify: httpsUrl, image: publicAsset, imageAlt: nonEmpty })).min(1),
    skills: z.array(z.object({ label: nonEmpty, items: nonEmpty })).min(1),
    education: z.object({ school: nonEmpty, place: nonEmpty, finished: nonEmpty, degree: nonEmpty }),
    contact: nonEmpty,
  }),
]);

const emptyToNull = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? null : value), schema.nullable());
const emptyToUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" || value === null ? undefined : value), schema.optional());
const secondaryRepoSchema = z.preprocess(
  (value) => value && typeof value === "object" && Object.values(value).every((item) => item === "") ? undefined : value,
  z.object({ label: nonEmpty, url: httpsUrl }).optional(),
);
export const projectSchema = z.object({
  name: nonEmpty,
  status: z.enum(["live", "completed", "in progress"]),
  summary: nonEmpty,
  stack: z.array(nonEmpty).min(1),
  image: emptyToNull(publicAsset),
  imageAlt: z.string(),
  repo: emptyToNull(httpsUrl),
  secondaryRepo: secondaryRepoSchema,
  additionalFigures: z.array(z.object({ image: publicAsset, imageAlt: nonEmpty })).default([]),
  order: z.number().int().positive(),
  featuredOrder: emptyToUndefined(z.number().int().positive()),
  kicker: emptyToUndefined(nonEmpty),
  lede: emptyToUndefined(nonEmpty),
}).superRefine((project, context) => {
  if (project.image && !project.imageAlt) {
    context.addIssue({ code: "custom", path: ["imageAlt"], message: "Image alt text is required when an image is set" });
  }
});

export const caseStudyIds = new Set(["clearsky", "appstack", "cdc", "portfolio", "cicd-containers", "cloud-detective"]);
const illustratedCaseStudyIds = new Set(["clearsky", "appstack", "cdc", "portfolio", "cicd-containers"]);

export const validateProjectSet = <T extends z.infer<typeof projectSchema> & { slug: string }>(projects: T[]): T[] => {
  const assertSequence = (values: number[], label: string) => {
    const sorted = [...values].sort((a, b) => a - b);
    if (sorted.some((value, index) => value !== index + 1)) {
      throw new Error(`${label} values must be unique and contiguous from 1`);
    }
  };
  if (projects.length !== 8) throw new Error(`Expected 8 projects, found ${projects.length}`);
  assertSequence(projects.map((project) => project.order), "Project order");
  const featuredOrders = projects.flatMap((project) => project.featuredOrder === undefined ? [] : [project.featuredOrder]);
  if (featuredOrders.length !== 3) throw new Error(`Expected 3 featured projects, found ${featuredOrders.length}`);
  assertSequence(featuredOrders, "Featured order");
  for (const project of projects) {
    if (caseStudyIds.has(project.slug) && (!project.kicker || !project.lede)) {
      throw new Error(`Case study metadata is required for ${project.slug}`);
    }
    if (illustratedCaseStudyIds.has(project.slug) && (!project.image || !project.imageAlt)) {
      throw new Error(`Case study image and alt text are required for ${project.slug}`);
    }
  }
  return projects;
};

const contentId = (entry: string, allowed: readonly string[], label: string) => {
  const id = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.(?:md|json)$/.exec(entry)?.[1];
  if (!id || !allowed.includes(id)) throw new Error(`${label} filename is invalid: ${entry}`);
  return id;
};

export const pageId = (entry: string) => contentId(entry, ["home", "about"], "Page");
export const projectId = (entry: string) =>
  contentId(entry, ["clearsky", "appstack", "cdc", "portfolio", "cicd-containers", "cloud-detective", "homelab-sync", "net-automation"], "Project");

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
