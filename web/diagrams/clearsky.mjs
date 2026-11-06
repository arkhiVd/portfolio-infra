// ClearSky architecture as a hand-placed SVG, dark like the site.
// Source of truth: arkhiVd/clearsky docs/architecture.drawio (21 nodes, 18 edges).
// Run: node web/diagrams/clearsky.mjs > web/public/assets/img/clearsky-architecture.svg
const C = { bg: "#0F1218", node: "#151A22", edge: "#2A313C", text: "#EDEDF0", muted: "#9B9BA3", accent: "#4FC1D4", group: "#0B0E13" };
const col = [150, 450, 750, 1050];
const row = [64, 196, 328, 460, 592, 736];
const W = 210, H = 58;
const at = (c, r) => ({ x: col[c], y: row[r] });

const nodes = {
  user: [0, 0, "Dashboard user"],
  gha: [3, 0, "GitHub Actions"],
  cf: [0, 1, "CloudFront"],
  cognito: [1, 1, "Cognito", "custom login"],
  evb: [2, 1, "EventBridge Scheduler", "daily"],
  iamci: [3, 1, "IAM · CI roles (OIDC)"],
  s3site: [0, 2, "S3 · dashboard (OAC)"],
  api: [1, 2, "Lambda · API", "function URL, JWT verify"],
  scanner: [2, 2, "Lambda · scanner", "24+ read-only detectors"],
  state: [3, 2, "S3 · Terraform state"],
  ssm: [0, 3, "SSM · registry", "+ SecureString key"],
  chat: [1, 3, "Lambda · agentic chat", "read-only tool loop"],
  sns: [2, 3, "SNS · daily digest"],
  ddb: [3, 3, "DynamoDB · findings", "new / open / resolved"],
  diagrams: [1, 4, "Lambda · diagrams", "discovery → draw.io"],
  budget: [3, 4, "AWS Budgets", "guardrail"],
  llm: [0, 5, "LLM provider"],
  email: [2, 5, "Ops email"],
  mrole: [3, 5, "clearsky-readonly role", "ViewOnlyAccess"],
};
const box = (id) => { const [c, r] = nodes[id]; const { x, y } = at(c, r); return { x, y, l: x - W / 2, r: x + W / 2, t: y - H / 2, b: y + H / 2 }; };

// Each edge: [from, to, label, dashed, points (polyline), label position].
const gapX = (c) => col[c] + 150; // the lane between column c and c + 1
const acctTop = row[1] - 62, acctBottom = row[4] + H / 2 + 26;
const e = [];
const edge = (from, to, label, dashed, points, lx, ly, anchor = "middle") => e.push({ from, to, label, dashed, points, lx, ly, anchor });
{
  const u = box("user"), cf = box("cf"), cg = box("cognito"), api = box("api"), s3 = box("s3site"), ssm = box("ssm"), ch = box("chat"),
    dg = box("diagrams"), sc = box("scanner"), ev = box("evb"), sn = box("sns"), dd = box("ddb"), ll = box("llm"), em = box("email"),
    mr = box("mrole"), gh = box("gha"), ic = box("iamci"), st = box("state");
  edge("user", "cf", "HTTPS", false, [[u.x, u.b], [cf.x, cf.t]], u.x + 10, (u.b + cf.t) / 2 + 5, "start");
  edge("user", "cognito", "sign-in", true, [[u.r, u.y], [cg.x, u.y], [cg.x, cg.t]], cg.x + 10, (u.y + cg.t) / 2 + 12, "start");
  edge("cf", "s3site", "static site, OAC", false, [[cf.x, cf.b], [s3.x, s3.t]], cf.x - 10, (cf.b + s3.t) / 2 - 6, "end");
  edge("cf", "api", "/api/*, OAC SigV4", false, [[cf.r, cf.y + 12], [gapX(0) - 12, cf.y + 12], [gapX(0) - 12, api.y - 12], [api.l, api.y - 12]], gapX(0) + 8, api.t - 10, "start");
  edge("api", "cognito", "JWT verify", true, [[api.x, api.t], [cg.x, cg.b]], api.x + 10, cg.b + 20, "start");
  const shelf = (s3.b + ssm.t) / 2; // the free band between the S3 and SSM rows
  edge("api", "ssm", "settings, registry", true, [[api.l, api.y + 12], [gapX(0) + 12, api.y + 12], [gapX(0) + 12, shelf], [ssm.x, shelf], [ssm.x, ssm.t]], (ssm.x + gapX(0)) / 2 + 6, shelf - 8, "middle");
  edge("api", "scanner", "on-demand scan", false, [[api.r, api.y - 10], [sc.l, sc.y - 10]], (api.r + sc.l) / 2, api.y - 18, "middle");
  edge("api", "chat", "chat job", false, [[api.x, api.b], [ch.x, ch.t]], api.x + 10, (api.b + ch.t) / 2 + 5, "start");
  edge("api", "diagrams", "diagram job", false, [[api.r, api.y + 16], [gapX(1) - 12, api.y + 16], [gapX(1) - 12, dg.y], [dg.r, dg.y]], gapX(1) - 4, (sn.b + dg.t) / 2 + 4, "start");
  edge("evb", "scanner", "daily", false, [[ev.x, ev.b], [sc.x, sc.t]], ev.x + 10, (ev.b + sc.t) / 2 + 5, "start");
  edge("scanner", "sns", "digest", false, [[sc.x, sc.b], [sn.x, sn.t]], sc.x - 10, (sc.b + sn.t) / 2 + 5, "end");
  edge("scanner", "ddb", "findings", false, [[sc.r, sc.y - 10], [gapX(2) - 10, sc.y - 10], [gapX(2) - 10, dd.y - 10], [dd.l, dd.y - 10]], gapX(2) - 16, (sc.b + sn.t) / 2 + 5, "end");
  edge("scanner", "mrole", "sts:AssumeRole, read-only", false, [[sc.r, sc.y + 14], [gapX(2) + 10, sc.y + 14], [gapX(2) + 10, mr.y], [mr.l, mr.y]], gapX(2) + 18, (acctBottom + mr.t - 16) / 2 + 5, "start");
  edge("chat", "ssm", "API key", true, [[ch.l, ch.y - 6], [ssm.r, ssm.y - 6]], (ch.l + ssm.r) / 2, ch.y - 14, "middle");
  edge("chat", "llm", "model call, HTTPS out", false, [[ch.l, ch.y + 16], [gapX(0) - 12, ch.y + 16], [gapX(0) - 12, ll.y], [ll.r, ll.y]], gapX(0) - 18, row[4] + 4, "end");
  edge("sns", "email", "email", false, [[sn.x, sn.b], [em.x, em.t]], sn.x + 10, row[4] + 4, "start");
  edge("gha", "iamci", "OIDC assume", false, [[gh.x, gh.b], [ic.x, ic.t]], gh.x + 10, (gh.b + ic.t) / 2 + 5, "start");
  edge("iamci", "state", "terraform state", true, [[ic.x, ic.b], [st.x, st.t]], ic.x + 10, (ic.b + st.t) / 2 + 5, "start");
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const out = [];
const width = col[3] + W / 2 + 40, height = row[5] + H / 2 + 56;
out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" font-family="ui-monospace, 'DejaVu Sans Mono', Menlo, Consolas, monospace">`);
out.push(`<title>ClearSky architecture: CloudFront serves the dashboard from S3 and routes /api to a Lambda API. The API starts scans, chat and diagram jobs. A daily schedule runs the scanner, which assumes a read-only role in member accounts, stores findings in DynamoDB and sends a digest by email. GitHub Actions deploys through OIDC roles.</title>`);
out.push(`<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.accent}"/></marker></defs>`);
out.push(`<rect width="${width}" height="${height}" rx="12" fill="${C.bg}"/>`);
// ClearSky account and member account boundaries.
out.push(`<rect x="20" y="${acctTop}" width="${width - 40}" height="${acctBottom - acctTop}" rx="12" fill="${C.group}" stroke="${C.edge}" stroke-dasharray="6 6"/>`);
const m = box("mrole");
out.push(`<rect x="${m.l - 16}" y="${m.t - 16}" width="${W + 32}" height="${H + 50}" rx="12" fill="${C.group}" stroke="${C.edge}" stroke-dasharray="6 6"/>`);
for (const ed of e) {
  const d = ed.points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
  out.push(`<path d="${d}" fill="none" stroke="${C.accent}" stroke-width="1.6"${ed.dashed ? ' stroke-dasharray="5 5"' : ""} marker-end="url(#a)"/>`);
}
for (const [id, [c, r, label, sub]] of Object.entries(nodes)) {
  const b = box(id);
  out.push(`<rect x="${b.l}" y="${b.t}" width="${W}" height="${H}" rx="8" fill="${C.node}" stroke="${C.accent}" stroke-opacity="0.55"/>`);
  if (sub) {
    out.push(`<text x="${b.x}" y="${b.y - 4}" text-anchor="middle" fill="${C.text}" font-size="15">${esc(label)}</text>`);
    out.push(`<text x="${b.x}" y="${b.y + 16}" text-anchor="middle" fill="${C.muted}" font-size="13">${esc(sub)}</text>`);
  } else {
    out.push(`<text x="${b.x}" y="${b.y + 5}" text-anchor="middle" fill="${C.text}" font-size="15">${esc(label)}</text>`);
  }
}
for (const ed of e) {
  out.push(`<text x="${ed.lx}" y="${ed.ly}" text-anchor="${ed.anchor}" fill="${C.muted}" font-size="13" paint-order="stroke" stroke="${C.bg}" stroke-width="5" stroke-linejoin="round">${esc(ed.label)}</text>`);
}
const halo = `paint-order="stroke" stroke="${C.bg}" stroke-width="6" stroke-linejoin="round"`;
out.push(`<text x="36" y="${acctTop + 22}" fill="${C.muted}" font-size="13" ${halo}>ClearSky account · us-east-1, scans every region</text>`);
out.push(`<text x="${m.x}" y="${m.b + 24}" text-anchor="middle" fill="${C.muted}" font-size="13" ${halo}>member accounts · any number</text>`);
out.push("</svg>");
process.stdout.write(out.join("\n") + "\n");
