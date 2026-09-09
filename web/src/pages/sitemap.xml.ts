import type { APIRoute } from "astro";
import { getPublishedBlogPosts, getPublishedReferences } from "../lib/content";
import { projects } from "../lib/projects";

const origin = "https://www.aravindakrishnan.cloud";
export const GET: APIRoute = async () => {
  const posts = await getPublishedBlogPosts();
  const references = await getPublishedReferences();
  const paths = [
    "/",
    "/projects.html",
    "/about.html",
    "/blog.html",
    ...projects
      .filter((project) => project.caseStudy)
      .map((project) => `${project.caseStudy}.html`),
    ...posts.map((post) => `/blog/${post.id}.html`),
    ...references.map((entry) => `/${entry.id}.html`),
  ];
  const urls = paths
    .map((path) => `  <url><loc>${origin}${path}</loc></url>`)
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
