// ClearSky architecture in the AWS reference-architecture style: official AWS Architecture Icons,
// AWS Cloud and AWS Account groups, straight or single-bend arrows, numbered steps with a legend.
// Graph source of truth: arkhiVd/clearsky docs/architecture.drawio (19 services, 18 edges).
// Run: node web/diagrams/clearsky.mjs > web/public/assets/img/clearsky-architecture.svg
import { C, ports, render } from "./aws-diagram.mjs";

const col = [90, 320, 530, 770, 1000, 1240];
const row = [112, 252, 392, 532, 672, 852];

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
// The member role sits right of its column so its account box clears the scanner's stem.
const nudge = { mrole: 24 };
const at = (id) => {
  const [c, r] = nodes[id];
  return ports(col[c] + (nudge[id] ?? 0), row[r]);
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
  step(5, jScan + 52, n.mrole.y - 18);
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
  "GitHub Actions assumes the CI roles through OIDC; Terraform state lives in S3.",
];
const dashedKey = "Dashed lines are sign-in, token checks and reads of settings or state.";

const width = col[5] + 130;
const legendTop = row[5] + 140;
const height = legendTop + (legend.length + 1) * 32 + 20;
const cloudX = col[1] - 128, cloudY = 20, cloudR = col[4] + 176, cloudB = row[5] + 96;
const m = at("mrole");
const memberX = (col[3] + col[4]) / 2 + 22;

process.stdout.write(render({
  width, height,
  title: `ClearSky architecture on AWS. ${legend.map((text, i) => `${i + 1}. ${text}`).join(" ")}`,
  // AWS Cloud contains the ClearSky account and the member accounts.
  groups: [
    { x: cloudX, y: cloudY, w: cloudR - cloudX, h: cloudB - cloudY, stroke: C.cloud, icon: "group-aws-cloud", label: "AWS Cloud" },
    { x: cloudX + 18, y: cloudY + 44, w: cloudR - cloudX - 60, h: row[4] + 96 - (cloudY + 44), stroke: C.account, icon: "group-aws-account", label: "ClearSky account · us-east-1 (all-region scanning)" },
    { x: memberX, y: m.y - 66, w: cloudR - 8 - memberX, h: 154, stroke: C.account, icon: "group-aws-account", label: "Member accounts (any number)" },
  ],
  paths,
  nodes: Object.entries(nodes).map(([id, [, , name, title, detail]]) => ({ ...at(id), icon: name, title, detail })),
  steps,
  legend: { x: cloudX, top: legendTop, items: legend, dashedKey },
}));
