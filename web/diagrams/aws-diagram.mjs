// Shared renderer for the site's AWS reference-style architecture diagrams.
// Each diagram module describes nodes, groups, lines and numbered steps; this file draws them.
// Icons: ./aws-icons (official AWS Architecture Icons, see NOTICE.md), embedded as data URIs
// so the SVG also works inside an <img>.
import { readFileSync } from "node:fs";

export const icon = (name) =>
  `data:image/svg+xml;base64,${readFileSync(new URL(`./aws-icons/${name}.svg`, import.meta.url)).toString("base64")}`;

// AWS dark diagram palette: squid-ink canvas, light lines, smile-orange steps, AWS group colours.
export const C = {
  canvas: "#232F3E", text: "#FFFFFF", sub: "#C8D0D9", line: "#C8D0D9",
  cloud: "#FFFFFF", account: "#E7157B", step: "#FF9900", stepText: "#232F3E",
  region: "#00A4A6", vpc: "#8C4FFF", publicSubnet: "#7AA116", privateSubnet: "#00A4A6", ecs: "#ED7100",
};
export const FONT = "Amazon Ember, Helvetica Neue, Helvetica, Arial, sans-serif";
export const S = 56; // icon size

/** Ports where lines meet a node: icon sides, top, and below its label lines. */
export const ports = (x, y, lines = 1) => {
  const h = S / 2 + 6;
  return { x, y, L: [x - h, y], R: [x + h, y], T: [x, y - h], B: [x, y + S / 2 + 48 + 17 * (lines - 1)] };
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const badge = (n, x, y) =>
  `<circle cx="${x}" cy="${y}" r="12" fill="${C.step}"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="${C.stepText}" font-size="14" font-weight="bold">${n}</text>`;

/**
 * spec: { width, height, title,
 *   groups: [{ x, y, w, h, stroke, icon, label, dash? }],
 *   paths: [{ points, dashed, arrow }],
 *   nodes: [{ x, y, icon, title, detail?: string | string[] }],
 *   steps: [{ n, x, y }],
 *   legend: { x, top, items: string[], dashedKey, notes?: string[] } }
 */
export const render = ({ width, height, title, groups, paths, nodes, steps, legend }) => {
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" font-family="${FONT}">`);
  out.push(`<title>${esc(title)}</title>`);
  out.push(`<defs><marker id="arrow" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${C.line}"/></marker></defs>`);
  out.push(`<rect width="${width}" height="${height}" fill="${C.canvas}"/>`);
  for (const g of groups) {
    out.push(`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" fill="none" stroke="${g.stroke}" stroke-width="1.5"${g.dash ? ` stroke-dasharray="${g.dash}"` : ""}/>`);
    out.push(`<image href="${icon(g.icon)}" x="${g.x}" y="${g.y}" width="32" height="32"/>`);
    out.push(`<text x="${g.x + 42}" y="${g.y + 21}" fill="${C.text}" font-size="15">${esc(g.label)}</text>`);
  }
  for (const { points, dashed, arrow } of paths) {
    const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
    out.push(`<path d="${d}" fill="none" stroke="${C.line}" stroke-width="1.6"${dashed ? ' stroke-dasharray="6 5"' : ""}${arrow ? ' marker-end="url(#arrow)"' : ""}/>`);
  }
  for (const n of nodes) {
    out.push(`<image href="${icon(n.icon)}" x="${n.x - S / 2}" y="${n.y - S / 2}" width="${S}" height="${S}"/>`);
    out.push(`<text x="${n.x}" y="${n.y + S / 2 + 21}" text-anchor="middle" fill="${C.text}" font-size="16">${esc(n.title)}</text>`);
    const detail = n.detail === undefined ? [] : [].concat(n.detail);
    detail.forEach((line, i) =>
      out.push(`<text x="${n.x}" y="${n.y + S / 2 + 40 + 17 * i}" text-anchor="middle" fill="${C.sub}" font-size="13">${esc(line)}</text>`));
  }
  for (const { n, x, y } of steps) out.push(badge(n, x, y));
  legend.items.forEach((text, i) => {
    const y = legend.top + i * 32;
    out.push(badge(i + 1, legend.x + 12, y));
    out.push(`<text x="${legend.x + 34}" y="${y + 5}" fill="${C.text}" font-size="15">${esc(text)}</text>`);
  });
  const y = legend.top + legend.items.length * 32;
  out.push(`<path d="M${legend.x} ${y}H${legend.x + 24}" stroke="${C.line}" stroke-width="1.6" stroke-dasharray="6 5"/>`);
  out.push(`<text x="${legend.x + 34}" y="${y + 5}" fill="${C.sub}" font-size="15">${esc(legend.dashedKey)}</text>`);
  (legend.notes ?? []).forEach((text, i) =>
    out.push(`<text x="${legend.x + 34}" y="${y + 37 + 32 * i}" fill="${C.sub}" font-size="15">${esc(text)}</text>`));
  out.push("</svg>");
  return out.join("\n") + "\n";
};
