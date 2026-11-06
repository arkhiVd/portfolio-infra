// ClearSky architecture as an SVG with official AWS Architecture Icons, drawn for the dark site.
// Graph source of truth: arkhiVd/clearsky docs/architecture.drawio (19 services, 18 edges, 2 groups).
// Icons: web/diagrams/aws-icons (see NOTICE.md). Embedded as data URIs so the file works in <img>.
// Run: node web/diagrams/clearsky.mjs > web/public/assets/img/clearsky-architecture.svg
import { readFileSync } from "node:fs";

const icon = (name) =>
  `data:image/svg+xml;base64,${readFileSync(new URL(`./aws-icons/${name}.svg`, import.meta.url)).toString("base64")}`;

const C = {
  canvas: "#0D1218", dot: "#1A222C", text: "#EDEDF0", muted: "#A3A8B1", edge: "#4FC1D4",
  cloud: "#8C95A1", account: "#E7157B", groupFill: "#111820",
};
const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";

// Left-to-right reading order: people and CI outside on the left, the account in the middle,
// external services and member accounts on the right.
const col = [90, 300, 510, 720, 930, 1150];
const row = [112, 262, 412, 562, 712];
const S = 56; // icon size

const nodes = {
  user: [0, 1, "users", "Dashboard user"],
  gha: [0, 4, "git-repository", "GitHub Actions"],
  cf: [1, 1, "cloudfront", "CloudFront"],
  cognito: [1, 2, "cognito", "Cognito", "custom login"],
  iamci: [1, 4, "iam", "IAM", "CI roles (OIDC)"],
  s3site: [2, 0, "s3", "S3", "dashboard (OAC)"],
  api: [2, 1, "lambda", "Lambda · API", "function URL, JWT verify"],
  state: [2, 4, "s3", "S3", "Terraform state"],
  diagrams: [3, 0, "lambda", "Lambda · diagrams", "discovery → draw.io"],
  chat: [3, 1, "lambda", "Lambda · agentic chat", "read-only tool loop"],
  scanner: [3, 2, "lambda", "Lambda · scanner", "24+ read-only detectors"],
  evb: [3, 3, "eventbridge", "EventBridge Scheduler", "daily"],
  budget: [3, 4, "budgets", "AWS Budgets", "guardrail"],
  ssm: [4, 1, "systems-manager", "SSM", "registry + SecureString key"],
  sns: [4, 2, "sns", "SNS", "daily digest"],
  ddb: [4, 3, "dynamodb", "DynamoDB · findings", "new / open / resolved"],
  llm: [5, 0, "internet", "LLM provider"],
  email: [5, 2, "email", "Ops email"],
  mrole: [5, 4, "iam-role", "clearsky-readonly role", "ViewOnlyAccess"],
};
// Ports: arrows meet the icon's sides; a port from below sits under the two label lines.
const port = (id) => {
  const [c, r] = nodes[id];
  const x = col[c], y = row[r], h = S / 2 + 6;
  return { x, y, L: [x - h, y], R: [x + h, y], T: [x, y - h], B: [x, y + 78] };
};
const lane = (c) => (col[c] + col[c + 1]) / 2; // the gap between column c and c + 1

const edges = [];
const edge = (label, dashed, points, lx, ly, anchor = "middle") => edges.push({ label, dashed, points, lx, ly, anchor });
{
  const p = Object.fromEntries(Object.keys(nodes).map((id) => [id, port(id)]));
  const { user, gha, cf, cognito, iamci, s3site, api, state, diagrams, chat, scanner, evb, ssm, sns, ddb, llm, email, mrole } = p;
  const g12 = lane(2), g34 = lane(3);
  // Serving path.
  edge("HTTPS", false, [user.R, cf.L], (user.R[0] + cf.L[0]) / 2, user.y - 10);
  edge("sign-in", true, [user.B, [user.x, cognito.y], cognito.L], user.x + 8, (user.B[1] + cognito.y) / 2 + 4, "start");
  edge("static site (OAC)", false, [cf.T, [cf.x, s3site.y], s3site.L], (cf.x + s3site.L[0]) / 2 + 8, s3site.y - 10);
  edge("/api/* (OAC SigV4)", false, [cf.R, api.L], (cf.R[0] + api.L[0]) / 2, cf.y - 10);
  edge("JWT verify", true, [api.B, [api.x, cognito.y], cognito.R], (api.x + cognito.R[0]) / 2, cognito.y - 10);
  // The API's four outgoing calls leave its right side at different heights and use separate lanes.
  edge("diagram job", false, [[api.R[0], api.y - 24], [g12 - 12, api.y - 24], [g12 - 12, diagrams.y], diagrams.L], (g12 - 12 + diagrams.L[0]) / 2, diagrams.y - 10);
  edge("chat job", false, [api.R, chat.L], (g12 + chat.L[0]) / 2 + 6, api.y - 10);
  const band = (row[1] + row[2]) / 2 + 20; // free strip between the chat captions and scanner icon
  edge("settings / registry", true, [[api.R[0], api.y + 16], [g12 + 26, api.y + 16], [g12 + 26, band], [ssm.x, band], ssm.B], (g12 + 26 + ssm.x) / 2 + 24, band + 16);
  edge("on-demand scan", false, [[api.R[0], api.y + 32], [g12 + 10, api.y + 32], [g12 + 10, scanner.y], scanner.L], scanner.L[0] - 6, scanner.y - 10, "end");
  // Chat.
  edge("API key", true, [chat.R, ssm.L], (chat.R[0] + ssm.L[0]) / 2, chat.y + 18);
  edge("model call (HTTPS out)", false, [[chat.R[0], chat.y - 22], [g34, chat.y - 22], [g34, llm.y], llm.L], (g34 + llm.L[0]) / 2, llm.y - 10);
  // Scheduled scan.
  edge("daily", false, [evb.T, scanner.B], evb.x + 8, (evb.T[1] + scanner.B[1]) / 2 + 4, "start");
  edge("digest", false, [scanner.R, sns.L], (scanner.R[0] + sns.L[0]) / 2, scanner.y - 10);
  edge("findings", false, [[scanner.R[0], scanner.y + 16], [g34 + 14, scanner.y + 16], [g34 + 14, ddb.y], ddb.L], g34 + 20, (scanner.y + ddb.y) / 2 + 30, "start");
  edge("sts:AssumeRole (read-only fan-out)", false, [[scanner.R[0], scanner.y + 32], [g34 - 14, scanner.y + 32], [g34 - 14, mrole.y], mrole.L], (g34 - 14 + mrole.L[0]) / 2, mrole.y - 10);
  edge("email", false, [sns.R, email.L], (sns.R[0] + email.L[0]) / 2, sns.y - 10);
  // Delivery.
  edge("OIDC assume", false, [gha.R, iamci.L], (gha.R[0] + iamci.L[0]) / 2, gha.y - 10);
  edge("terraform state", true, [iamci.R, state.L], (iamci.R[0] + state.L[0]) / 2, iamci.y - 10);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const width = col[5] + 130, height = row[4] + 118;
const halo = `paint-order="stroke" stroke="${C.canvas}" stroke-width="5" stroke-linejoin="round"`;
const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" font-family="${FONT}">`);
out.push(`<title>ClearSky architecture: CloudFront serves the dashboard from S3 and routes /api to a Lambda API that verifies Cognito sign-in. The API starts scans, chat and diagram jobs. A daily EventBridge schedule runs the scanner, which assumes a read-only role in each member account, stores findings in DynamoDB and sends an SNS digest by email. GitHub Actions deploys through OIDC roles.</title>`);
out.push(`<defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${C.dot}"/></pattern>`);
out.push(`<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0.8L10 5L0 9.2z" fill="${C.edge}"/></marker></defs>`);
out.push(`<rect width="${width}" height="${height}" fill="${C.canvas}"/><rect width="${width}" height="${height}" fill="url(#dots)"/>`);

// AWS group boxes in the AWS diagram convention: cloud group with its logo, account group with its icon.
const gx = col[1] - 112, gy = 22, gw = col[4] + 102 - gx, gh = row[4] + 100 - gy;
out.push(`<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${C.groupFill}" stroke="${C.cloud}" stroke-width="1.2"/>`);
out.push(`<image href="${icon("group-aws-cloud")}" x="${gx}" y="${gy}" width="32" height="32"/>`);
out.push(`<text x="${gx + 40}" y="${gy + 21}" fill="${C.text}" font-size="14">AWS Cloud · ClearSky account (us-east-1, scans every region)</text>`);
const m = port("mrole"), mx = m.x - 108, my = m.y - 76, mw = 222, mh = 168;
out.push(`<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="${C.groupFill}" stroke="${C.account}" stroke-width="1.2"/>`);
out.push(`<image href="${icon("group-aws-account")}" x="${mx}" y="${my}" width="32" height="32"/>`);
out.push(`<text x="${mx + 40}" y="${my + 21}" fill="${C.text}" font-size="14">Member accounts</text>`);

for (const e of edges) {
  const d = e.points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
  out.push(`<path d="${d}" fill="none" stroke="${C.edge}" stroke-width="1.7" stroke-linejoin="round"${e.dashed ? ' stroke-dasharray="6 5"' : ""} marker-end="url(#arrow)"/>`);
}
for (const [id, [, , name, label, sub]] of Object.entries(nodes)) {
  const { x, y } = port(id);
  out.push(`<image href="${icon(name)}" x="${x - S / 2}" y="${y - S / 2}" width="${S}" height="${S}"/>`);
  out.push(`<text x="${x}" y="${y + S / 2 + 20}" text-anchor="middle" fill="${C.text}" font-size="16" ${halo}>${esc(label)}</text>`);
  if (sub) out.push(`<text x="${x}" y="${y + S / 2 + 38}" text-anchor="middle" fill="${C.muted}" font-size="14" ${halo}>${esc(sub)}</text>`);
}
for (const e of edges) {
  out.push(`<text x="${e.lx}" y="${e.ly}" text-anchor="${e.anchor}" fill="${C.muted}" font-size="14" ${halo}>${esc(e.label)}</text>`);
}
out.push("</svg>");
process.stdout.write(out.join("\n") + "\n");
