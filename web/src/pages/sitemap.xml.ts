import type { APIRoute } from "astro";
import { projects } from "../lib/projects";

const origin = "https://www.aravindakrishnan.cloud";
const paths = [
  "/",
  "/projects.html",
  "/about.html",
  ...projects
    .filter((project) => project.caseStudy)
    .map((project) => `${project.caseStudy}.html`),
];

export const GET: APIRoute = () => {
  const urls = paths
    .map((path) => `  <url><loc>${origin}${path}</loc></url>`)
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
