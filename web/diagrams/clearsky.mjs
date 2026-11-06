// ClearSky architecture in the AWS reference-architecture style: official AWS Architecture Icons,
// AWS Cloud and AWS Account groups, straight or single-bend arrows, numbered steps with a legend.
// Graph source of truth: arkhiVd/clearsky docs/architecture.drawio (19 services, 18 edges).
// Icons: web/diagrams/aws-icons (see NOTICE.md). Embedded as data URIs so the file works in <img>.
// Run: node web/diagrams/clearsky.mjs > web/public/assets/img/clearsky-architecture.svg
import { readFileSync } from "node:fs";

const icon = (name) =>
  `data:image/svg+xml;base64,${readFileSync(new URL(`./aws-icons/${name}.svg`, import.meta.url)).toString("base64")}`;

// AWS dark diagram palette: squid-ink canvas, white cloud group, account pink, smile-orange steps.
const C = {
  canvas: "#232F3E", text: "#FFFFFF", sub: "#C8D0D9", line: "#C8D0D9",
  cloud: "#FFFFFF", account: "#E7157B", step: "#FF9900", stepText: "#232F3E",
};
const FONT = "Amazon Ember, Helvetica Neue, Helvetica, Arial, sans-serif";

const col = [90, 320, 530, 770, 1000, 1240];
const row = [112, 252, 392, 532, 672, 852];
const S = 56;

// [column, row, icon, name, detail]
const nodes = {
  user: [0, 2, "users", "Dashboard user"],
  gha: [0, 4, "git-repository", "GitHub Actions"],
  s3site: [1, 1, "s3", "Amazon S3", "dashboard bucket (OAC)"],
  cf: [1, 2, "cloudfront", "Amazon CloudFront"],
  cognito: [1, 3, "cognito", "Amazon Cognito", "custom login"],
  iamci: [1, 4, "iam", "AWS IAM", "CI roles (OIDC)"],
  api: [2, 2, "lambda", "AWS Lambda", "API · function URL, JWT verify"],
  state: [2, 4, "s3", "Amazon S3", "Terraform state"],
  ssm: [3, 0, "systems-manager", "AWS Systems Manager", "registry + SecureString key"],
  chat: [3, 1, "lambda", "AWS Lambda", "agentic chat · read-only tools"],
  diagrams: [3, 2, "lambda", "AWS Lambda", "diagrams · discovery → draw.io"],
  scanner: [3, 3, "lambda", "AWS Lambda", "scanner · 24+ read-only detectors"],
  evb: [3, 4, "eventbridge", "Amazon EventBridge", "Scheduler · daily"],
  sns: [4, 2, "sns", "Amazon SNS", "daily digest"],
  ddb: [4, 3, "dynamodb", "Amazon DynamoDB", "findings: new / open / resolved"],
  budget: [4, 4, "budgets", "AWS Budgets", "guardrail"],
  mrole: [4, 5, "iam-role", "IAM role", "clearsky-readonly (ViewOnlyAccess)"],
  llm: [5, 1, "internet", "LLM provider"],
  email: [5, 2, "email", "Ops email"],
};
const at = (id) => {
  const [c, r] = nodes[id];
  const x = col[c], y = row[r], h = S / 2 + 6;
  return { x, y, L: [x - h, y], R: [x + h, y], T: [x, y - h], B: [x, y + S / 2 + 48] };
};

const paths = []; // [points, dashed, arrow]
const steps = []; // [n, x, y]
const line = (points, dashed = false, arrow = true) => paths.push({ points, dashed, arrow });
const step = (n, x, y) => steps.push({ n, x, y });
{
  const n = Object.fromEntries(Object.keys(nodes).map((id) => [id, at(id)]));
  const jApi = (col[2] + col[3]) / 2, jScan = (col[3] + col[4]) / 2;

  // 1 · sign-in and the dashboard.
  line([n.user.R, n.cf.L]);
  line([n.user.B, [n.user.x, n.cognito.y], n.cognito.L], true);
  line([n.cf.T, n.s3site.B]);
  step(1, (n.user.R[0] + n.cf.L[0]) / 2, n.user.y - 18);
  // 2 · /api/* through CloudFront to the API, which verifies the JWT with Cognito.
  line([n.cf.R, n.api.L]);
  line([n.api.B, [n.api.x, n.cognito.y], n.cognito.R], true);
  step(2, (n.cf.R[0] + n.api.L[0]) / 2, n.cf.y - 18);
  // The API fans out to its three jobs from one junction.
  line([n.api.R, [jApi, n.api.y]], false, false);
  line([[jApi, n.chat.y], [jApi, n.scanner.y]], false, false);
  line([[jApi, n.chat.y], n.chat.L]);
  line([[jApi, n.diagrams.y], n.diagrams.L]);
  line([[jApi, n.scanner.y], n.scanner.L]);
  step(3, jApi + 26, n.diagrams.y - 18);
  // The API reads settings and the registry from SSM.
  line([n.api.T, [n.api.x, n.ssm.y], n.ssm.L], true);
  // 4 · the daily schedule.
  line([n.evb.T, n.scanner.B]);
  step(4, n.evb.x + 22, (n.evb.T[1] + n.scanner.B[1]) / 2);
  // 5, 6 · the scanner fans out: digest, findings, and the member accounts.
  line([n.scanner.R, [jScan, n.scanner.y]], false, false);
  line([[jScan, n.sns.y], [jScan, n.mrole.y]], false, false);
  line([[jScan, n.sns.y], n.sns.L]);
  line([[jScan, n.ddb.y], n.ddb.L]);
  line([[jScan, n.mrole.y], n.mrole.L]);
  line([n.sns.R, n.email.L]);
  step(5, jScan + 22, (n.budget.y + n.mrole.y) / 2);
  step(6, jScan + 26, n.ddb.y - 18);
  // 7 · chat reads its API key from SSM and calls the model.
  line([n.chat.T, n.ssm.B], true);
  line([n.chat.R, n.llm.L]);
  step(7, (n.chat.R[0] + jScan) / 2 + 40, n.chat.y - 18);
  // 8 · delivery.
  line([n.gha.R, n.iamci.L]);
  line([n.iamci.R, n.state.L], true);
  step(8, (n.gha.R[0] + n.iamci.L[0]) / 2, n.gha.y - 18);
}

const legend = [
  "Users sign in with Amazon Cognito and load the dashboard from S3 through CloudFront.",
  "CloudFront sends /api/* to the API Lambda (OAC SigV4); it verifies the JWT with Cognito.",
  "The API starts a chat job, a diagram job or an on-demand scan, and reads SSM settings.",
  "EventBridge Scheduler runs the scanner every day.",
  "The scanner assumes a read-only role in each member account (sts:AssumeRole).",
  "Findings go to DynamoDB; the daily digest goes through SNS to email.",
  "The chat Lambda reads its API key from SSM and calls the LLM provider over HTTPS.",
  "GitHub Actions deploys through OIDC CI roles; Terraform state lives in S3.",
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const width = col[5] + 130;
const legendTop = row[5] + 140;
const height = legendTop + legend.length * 32 + 20;
const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" font-family="${FONT}">`);
out.push(`<title>ClearSky architecture on AWS. ${legend.map((text, i) => `${i + 1}. ${text}`).join(" ")}</title>`);
out.push(`<defs><marker id="arrow" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${C.line}"/></marker></defs>`);
out.push(`<rect width="${width}" height="${height}" fill="${C.canvas}"/>`);

// Groups: AWS Cloud contains the ClearSky account and the member accounts.
const group = (x, y, w, h, stroke, iconName, label) => {
  out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${stroke}" stroke-width="1.5"/>`);
  out.push(`<image href="${icon(iconName)}" x="${x}" y="${y}" width="32" height="32"/>`);
  out.push(`<text x="${x + 42}" y="${y + 21}" fill="${C.text}" font-size="15">${esc(label)}</text>`);
};
const cloudX = col[1] - 128, cloudY = 20, cloudR = col[4] + 152, cloudB = row[5] + 96;
group(cloudX, cloudY, cloudR - cloudX, cloudB - cloudY, C.cloud, "group-aws-cloud", "AWS Cloud");
group(cloudX + 18, cloudY + 44, cloudR - cloudX - 60, row[4] + 96 - (cloudY + 44), C.account, "group-aws-account", "ClearSky account · us-east-1 (scans every enabled region)");
const m = at("mrole");
group(m.x - 136, m.y - 66, 272, 154, C.account, "group-aws-account", "Member accounts (any number)");

for (const { points, dashed, arrow } of paths) {
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
  out.push(`<path d="${d}" fill="none" stroke="${C.line}" stroke-width="1.6"${dashed ? ' stroke-dasharray="6 5"' : ""}${arrow ? ' marker-end="url(#arrow)"' : ""}/>`);
}
for (const [id, [, , name, title, detail]] of Object.entries(nodes)) {
  const { x, y } = at(id);
  out.push(`<image href="${icon(name)}" x="${x - S / 2}" y="${y - S / 2}" width="${S}" height="${S}"/>`);
  out.push(`<text x="${x}" y="${y + S / 2 + 21}" text-anchor="middle" fill="${C.text}" font-size="16">${esc(title)}</text>`);
  if (detail) out.push(`<text x="${x}" y="${y + S / 2 + 40}" text-anchor="middle" fill="${C.sub}" font-size="13">${esc(detail)}</text>`);
}
const badge = (n, x, y) =>
  `<circle cx="${x}" cy="${y}" r="12" fill="${C.step}"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="${C.stepText}" font-size="14" font-weight="bold">${n}</text>`;
for (const { n, x, y } of steps) out.push(badge(n, x, y));

// Legend: the numbered flow.
legend.forEach((text, i) => {
  const x = cloudX, y = legendTop + i * 32;
  out.push(badge(i + 1, x + 12, y));
  out.push(`<text x="${x + 34}" y="${y + 5}" fill="${C.text}" font-size="15">${esc(text)}</text>`);
});
out.push("</svg>");
process.stdout.write(out.join("\n") + "\n");
