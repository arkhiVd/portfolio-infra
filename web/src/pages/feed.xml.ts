import type { APIRoute } from "astro";
import { getPublishedBlogPosts } from "../lib/content";

const origin = "https://www.aravindakrishnan.cloud";
const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const GET: APIRoute = async () => {
  const posts = await getPublishedBlogPosts();
  const items = posts
    .map((post) => {
      const link = `${origin}/blog/${post.id}.html`;
      const escapedLink = escapeXml(link);
      return `<item><title>${escapeXml(post.data.title)}</title><link>${escapedLink}</link><guid isPermaLink="true">${escapedLink}</guid><description>${escapeXml(post.data.description)}</description><pubDate>${new Date(`${post.data.published}T00:00:00Z`).toUTCString()}</pubDate></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Aravindakrishnan V</title><link>${origin}/blog.html</link><description>Notes on operating cloud infrastructure.</description><atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${origin}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
