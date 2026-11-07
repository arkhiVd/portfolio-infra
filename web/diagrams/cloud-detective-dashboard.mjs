// Cloud Detective: the dashboard and the AI agent, in the AWS reference-architecture style.
// Source of truth: arkhiVd/cloud-detective terraform/dashboard.tf, chat.tf, architecture.tf, ssm.tf
// and src/detective/chat.py (the repo has no diagram source). There is no CloudFront: dashboard.tf
// notes the account could not create distributions, and API Gateway serves HTTPS.
// Run: node web/diagrams/cloud-detective-dashboard.mjs > web/public/assets/img/cloud-detective-dashboard.svg
import { C, ports, render } from "./aws-diagram.mjs";

const col = [90, 344, 552, 760, 980, 1200];
const row = [0, 240, 440, 620, 800];

// [x, y, icon, title, detail]
const spec = {
  users: [col[0], row[1], "users", "Users", "admin-created only"],
  apigw: [col[1], row[1], "api-gateway", "Amazon API Gateway", ["HTTP API", "JWT check on /api/*"]],
  api: [col[2], row[1], "lambda", "AWS Lambda", ["api · dashboard + JSON API", "reads findings, reports"]],
  chat: [col[3], row[1], "lambda", "AWS Lambda", ["chat agent · tool-use loop", "ViewOnlyAccess"]],
  llm: [col[5], row[1], "internet", "LLM provider", ["OpenAI-compatible API", "outside AWS"]],
  cognito: [col[1], row[2], "cognito", "Amazon Cognito", ["user pool", "code + PKCE"]],
  findings: [col[4], row[2], "dynamodb", "Amazon DynamoDB", ["findings, conversations"]],
  arch: [col[3], row[3], "lambda", "AWS Lambda", ["architecture worker", "ViewOnlyAccess"]],
  reports: [col[4], row[3], "s3", "Amazon S3", ["architecture/ jobs", "draw.io + SVG"]],
  scanner: [col[3], row[4], "lambda", "AWS Lambda", ["scanner", "Run scan, on demand"]],
};
const n = Object.fromEntries(Object.entries(spec).map(([id, [x, y, , , detail]]) =>
  [id, ports(x, y, detail === undefined ? 1 : [].concat(detail).length)]));

const paths = [];
const steps = [];
const line = (points, dashed = false) => paths.push({ points, dashed, arrow: true });
const step = (num, x, y) => steps.push({ n: num, x, y });

line([n.users.B, [n.users.x, n.cognito.y], n.cognito.L]);
step(1, n.users.x + 60, n.cognito.y - 18); // left of the AWS Cloud edge
line([n.apigw.B, n.cognito.T], true);
step(2, n.apigw.x + 22, (n.apigw.B[1] + n.cognito.T[1]) / 2);
line([n.users.R, n.apigw.L]);
line([n.apigw.R, n.api.L]);
step(3, (n.apigw.R[0] + n.api.L[0]) / 2, n.apigw.y - 18);
line([n.api.R, n.chat.L]);
step(4, (n.api.R[0] + n.chat.L[0]) / 2, n.api.y - 18);
// The model call leaves AWS; the agent's findings writes stay in DynamoDB.
line([n.chat.R, n.llm.L]);
step(5, n.llm.L[0] - 32, n.chat.y - 18); // past the AWS Cloud edge
line([n.chat.B, [n.chat.x, n.findings.y], n.findings.L]);
step(6, (n.chat.x + n.findings.L[0]) / 2, n.findings.y - 18);
// The API Lambda's lane to the workers it invokes.
line([n.api.B, [n.api.x, n.arch.y], n.arch.L]);
line([[n.api.x, n.arch.y], [n.api.x, n.scanner.y], n.scanner.L]);
line([n.arch.R, n.reports.L]);
step(7, (n.arch.R[0] + n.reports.L[0]) / 2, n.arch.y - 18);
step(8, (n.api.x + n.scanner.L[0]) / 2, n.scanner.y - 18);

const legend = [
  "Users sign in with Cognito (authorization code with PKCE); there is no self sign-up.",
  "API Gateway checks the Cognito token on every /api/* route; the page shell is public.",
  "One Lambda serves the dashboard and its JSON API.",
  "Ask the detective: the API Lambda invokes the chat agent asynchronously, and the page polls.",
  "Only model calls leave AWS, to an OpenAI-compatible provider whose key is in SSM SecureString.",
  "The agent reads AWS under ViewOnlyAccess, can add or resolve findings, and can edit a diagram.",
  "The architecture worker discovers resources and writes the diagram to S3.",
  "Run scan invokes the scanner on demand.",
];
const dashedKey = "Dashed line: API Gateway validating the Cognito token.";
const notes = [
  "There is no CloudFront: the account could not create distributions, and API Gateway serves HTTPS.",
  "The chat agent and the architecture worker also assume the member accounts' read-only role.",
  "The architecture worker also calls the provider for its optional summary and AI layout pass.",
  "The API Lambda also reads and writes the conversations, diagram jobs and settings.",
];

const cloud = { x: 200, y: 20, r: 1100, b: row[4] + 150 };
const home = { x: 220, y: 60, r: 1084, b: cloud.b - 16 };
const region = { x: 240, y: 100, r: 1070, b: home.b - 16 };
const width = 1300;
const legendTop = cloud.b + 44;
const height = legendTop + (legend.length + 1 + notes.length) * 32 + 20;
const box = (g, stroke, icon, label, dash) => ({ x: g.x, y: g.y, w: g.r - g.x, h: g.b - g.y, stroke, icon, label, dash });

process.stdout.write(render({
  width, height,
  title: `Cloud Detective dashboard and AI agent on AWS. ${legend.map((text, i) => `${i + 1}. ${text}`).join(" ")} ${notes.join(" ")}`,
  groups: [
    box(cloud, C.cloud, "group-aws-cloud", "AWS Cloud"),
    box(home, C.account, "group-aws-account", "AWS Account · where Cloud Detective runs"),
    box(region, C.region, "group-region", "AWS Region · us-east-1", "6 5"),
  ],
  paths,
  junctions: [[n.api.x, n.arch.y]],
  nodes: Object.entries(spec).map(([id, [, , iconName, title, detail]]) => ({ ...n[id], icon: iconName, title, detail })),
  steps,
  legend: { x: cloud.x, top: legendTop, items: legend, dashedKey, notes },
}));
