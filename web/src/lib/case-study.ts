import type { Project } from "./projects";

const requiredLabels = ["problem", "architecture", "decisions and tradeoffs", "what broke"];
const allowedTags = new Set(["section", "p", "h2", "figure", "figcaption", "dl", "div", "dt", "dd", "ul", "li", "b", "span", "strong", "code"]);
const allowedAttributes: Record<string, RegExp> = {
  section: /^ class="block wrap"$/,
  p: /^(?: class="label")?$/,
  figure: /^ class="arch" data-project-figure="\d+"$/,
  dl: /^ class="rows"$/,
  div: /^ class="row"$/,
  ul: /^ class="metrics"$/,
};
const allowedChildren: Record<string, Set<string>> = {
  section: new Set(["p", "h2", "figure", "dl", "ul"]),
  p: new Set(["code", "strong"]),
  h2: new Set(),
  figure: new Set(["figcaption"]),
  figcaption: new Set(["code", "strong"]),
  dl: new Set(["div"]),
  div: new Set(["dt", "dd"]),
  dt: new Set(["code", "strong"]),
  dd: new Set(["code", "strong"]),
  ul: new Set(["li"]),
  li: new Set(["b", "span", "code", "strong"]),
  b: new Set(),
  span: new Set(["code", "strong"]),
  strong: new Set(["code"]),
  code: new Set(),
};

/** Anchor id for a section label: "decisions and tradeoffs" becomes "decisions-and-tradeoffs". */
export const sectionId = (label: string) =>
  label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" };
// Plain text for an Astro expression, which escapes it again: drop tags, decode the basic entities.
const stripTags = (value: string) =>
  value
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (_match, name: string) => entities[name])
    .replace(/\s+/g, " ")
    .trim();

/** The section labels of a case-study body, in order, for the contents rail. */
export const caseStudySections = (body: string) =>
  [...body.matchAll(/<p class="label">([^<]+)<\/p>/g)].map((match) => ({ id: sectionId(match[1]), label: match[1] }));

/** The figures in the body's first metrics list, as plain text, for the strip under the lede. */
export const caseStudyMetrics = (body: string) =>
  [...(body.match(/<ul class="metrics">([\s\S]*?)<\/ul>/)?.[1] ?? "").matchAll(/<li><b>([\s\S]*?)<\/b><span>([\s\S]*?)<\/span><\/li>/g)].map((match) => ({
    value: stripTags(match[1]),
    label: stripTags(match[2]),
  }));

const escapeAttribute = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

/**
 * Renders the tightly constrained HTML stored in a project Markdown body. Figure files and
 * alt text stay in the project record, so an editor cannot make a case-study figure disagree
 * with its project-card metadata.
 */
export const renderCaseStudyBody = (body: string, project: Project) => {
  if (/<\/?(?:script|style|iframe|object|embed|svg|img)\b|\son[a-z]+\s*=|javascript:/i.test(body)) {
    throw new Error(`Unsafe case-study HTML in ${project.slug}`);
  }
  const stack: string[] = [];
  const sectionChildren: Array<Array<{ tag: string; attributes: string }>> = [];
  let tagEnd = 0;
  for (const match of body.matchAll(/<\/?([a-z0-9]+)([^>]*)>/gi)) {
    if (stack.length === 0 && body.slice(tagEnd, match.index).trim()) {
      throw new Error(`Text outside a case-study section in ${project.slug}`);
    }
    const [, rawTag, attributes] = match;
    tagEnd = match.index + match[0].length;
    const tag = rawTag.toLowerCase();
    const closing = match[0][1] === "/";
    if (!allowedTags.has(tag) || (!closing && !(allowedAttributes[tag] ?? /^$/).test(attributes))) {
      throw new Error(`Unsupported case-study HTML in ${project.slug}`);
    }
    if (closing) {
      if (attributes !== "" || stack.pop() !== tag) throw new Error(`Malformed case-study HTML in ${project.slug}`);
      continue;
    }
    if (stack.length === 0) {
      if (tag !== "section") throw new Error(`Case-study body must contain top-level sections in ${project.slug}`);
      sectionChildren.push([]);
    } else {
      const parent = stack.at(-1)!;
      if (tag === "section" || !allowedChildren[parent]?.has(tag)) {
        throw new Error(`Unsupported ${tag} inside ${parent} in ${project.slug}`);
      }
      if (parent === "section") sectionChildren.at(-1)!.push({ tag, attributes });
    }
    stack.push(tag);
  }
  if (stack.length !== 0 || body.slice(tagEnd).trim() || sectionChildren.some((children) =>
    children[0]?.tag !== "p" || children[0]?.attributes !== ' class="label"' || children[1]?.tag !== "h2")) {
    throw new Error(`Malformed case-study section structure in ${project.slug}`);
  }

  const labels = [...body.matchAll(/<p class="label">([^<]+)<\/p>/g)].map((match) => match[1]);
  if (labels.length !== sectionChildren.length || requiredLabels.some((label, index) => labels[index] !== label)) {
    throw new Error(`Case-study sections are invalid for ${project.slug}`);
  }
  const ids = labels.map(sectionId);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error(`Case-study section labels must give unique anchors in ${project.slug}`);
  }
  const figures = project.image
    ? [{ image: project.image, imageAlt: project.imageAlt }, ...project.additionalFigures]
    : project.additionalFigures;
  const markers = [...body.matchAll(/<figure class="arch" data-project-figure="(\d+)">/g)].map((match) => Number(match[1]));
  if (markers.length !== figures.length || markers.some((value, index) => value !== index)) {
    throw new Error(`Case-study figure markers are invalid for ${project.slug}`);
  }

  let section = 0;
  return body.replace(/<section class="block wrap">/g, () =>
    `<section class="block wrap" id="${sectionId(labels[section++])}">`,
  ).replace(
    /<figure class="arch" data-project-figure="(\d+)">([\s\S]*?)<\/figure>/g,
    (_match, indexText, caption) => {
      const index = Number(indexText);
      const figure = figures[index];
      if (!figure) throw new Error(`Unknown figure ${index} in ${project.slug}`);
      // The link opens the full-size file: on a phone a wide diagram is panned or zoomed there.
      const src = escapeAttribute(figure.image);
      return `<figure class="arch"><a class="arch-open" href="${src}"><img src="${src}" alt="${escapeAttribute(figure.imageAlt)}" loading="lazy" decoding="async"></a>${caption}</figure>`;
    },
  );
};
