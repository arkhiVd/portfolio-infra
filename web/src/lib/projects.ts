import { getCollection, type CollectionEntry } from "astro:content";
import { caseStudyIds, validateProjectSet } from "./content-schema";

export type Project = CollectionEntry<"project">["data"] & {
  slug: string;
  caseStudy: string | null;
};

const toProject = (entry: CollectionEntry<"project">): Project => ({
  ...entry.data,
  slug: entry.id,
  caseStudy: caseStudyIds.has(entry.id) ? `/projects/${entry.id}` : null,
});

const allProjects = validateProjectSet((await getCollection("project")).map(toProject))
  .sort((a, b) => a.order - b.order);

export const getProjects = async (): Promise<Project[]> => [...allProjects];

export const getFeaturedProjects = async (): Promise<Project[]> =>
  allProjects
    .filter((project) => project.featuredOrder !== undefined)
    .sort((a, b) => a.featuredOrder! - b.featuredOrder!);

export const getProject = async (slug: string): Promise<Project> => {
  const project = allProjects.find((entry) => entry.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
};

// Compatibility adapter for components that consume the complete project list.
export const projects = allProjects;
