// Cloud Detective: the daily scan, in the AWS reference-architecture style.
// Source of truth: arkhiVd/cloud-detective terraform/main.tf, iam.tf, ssm.tf, member-role/main.tf
// and src/detective/handler.py + store.py (the repo has no diagram source). 20 detector classes
// register in src/detective/detectors. The README says 24, which matches if it also counts the four
// report modules (cost watch, inventory, posture, commitments); the repo doesn't say.
// Run: node web/diagrams/cloud-detective-scan.mjs > web/public/assets/img/cloud-detective-scan.svg
import { C, ports, render } from "./aws-diagram.mjs";

const col = [90, 330, 570, 810, 1060];
const row = [0, 240, 440, 640, 880];
const J = (col[2] + col[3]) / 2; // the scanner's output lane

// [x, y, icon, title, detail]
const spec = {
  scheduler: [col[1], row[1], "eventbridge-scheduler", "EventBridge Scheduler", "daily at 01:30 UTC"],
  scanner: [col[2], row[1], "lambda", "AWS Lambda", ["scanner · 20 detectors", "Python 3.13"]],
  ssm: [col[1], row[2], "parameter-store", "Parameter Store", ["account registry", "/cloud-detective/accounts"]],
  findings: [col[3], row[1], "dynamodb", "Amazon DynamoDB", ["findings table", "new · open · resolved"]],
  reports: [col[3], row[2], "s3", "Amazon S3", ["reports bucket", "cost, inventory, posture"]],
  sns: [col[3], row[3], "sns", "Amazon SNS", "digest topic"],
  email: [col[4], row[3], "email", "Email", "plain-text digest"],
  member: [col[2], row[4], "iam-role", "IAM role", ["cloud-detective-readonly", "SecurityAudit + ViewOnlyAccess"]],
};
const n = Object.fromEntries(Object.entries(spec).map(([id, [x, y, , , detail]]) =>
  [id, ports(x, y, detail === undefined ? 1 : [].concat(detail).length)]));

const paths = [];
const steps = [];
const line = (points, dashed = false) => paths.push({ points, dashed, arrow: true });
const step = (num, x, y) => steps.push({ n: num, x, y });

line([n.scheduler.R, n.scanner.L]);
step(1, (n.scheduler.R[0] + n.scanner.L[0]) / 2, n.scheduler.y - 18);
line([[n.scanner.x - 28, n.scanner.B[1]], [n.scanner.x - 28, n.ssm.y], n.ssm.R], true);
step(2, (n.ssm.R[0] + n.scanner.x - 28) / 2, n.ssm.y - 18);
line([n.scanner.B, n.member.T], true);
step(3, n.scanner.x + 22, row[3] + 40); // above the account edge
// One lane fans out to the three outputs.
line([n.scanner.R, n.findings.L]);
step(4, (n.scanner.R[0] + J) / 2, n.scanner.y - 18);
line([[J, n.scanner.y], [J, n.reports.y], n.reports.L]);
step(5, (J + n.reports.L[0]) / 2, n.reports.y - 18);
line([[J, n.scanner.y], [J, n.sns.y], n.sns.L]);
step(6, (J + n.sns.L[0]) / 2, n.sns.y - 18);
line([n.sns.R, n.email.L]);

const legend = [
  "EventBridge Scheduler invokes the scanner Lambda every day at 01:30 UTC.",
  "The scanner reads the account registry, which the dashboard writes when an account is onboarded.",
  "For each member account it assumes the cloud-detective-readonly role.",
  "Findings are reconciled in DynamoDB as new, open or resolved, only for the accounts this run scanned.",
  "Cost, inventory and posture snapshots go to the reports bucket.",
  "SNS emails a plain-text digest.",
];
const dashedKey = "Dashed lines: reading the registry and assuming member roles.";
const notes = [
  "The scanner's role allows only describe, list and get calls on scanned services;",
  "it writes only to its own table, bucket prefixes and topic. Optional Bedrock triage is off by default.",
];

const cloud = { x: 200, y: 20, r: 950, b: row[4] + 130 };
const home = { x: 220, y: 60, r: 930, b: row[3] + 130 };
const region = { x: 240, y: 100, r: 915, b: home.b - 16 };
const members = { x: 280, y: home.b + 24, r: 860, // label ends left of the role line
  b: cloud.b - 16 };
const width = 1140;
const legendTop = cloud.b + 44;
const height = legendTop + (legend.length + 1 + notes.length) * 32 + 20;
const box = (g, stroke, icon, label, dash) => ({ x: g.x, y: g.y, w: g.r - g.x, h: g.b - g.y, stroke, icon, label, dash });

process.stdout.write(render({
  width, height,
  title: `Cloud Detective daily scan on AWS. ${legend.map((text, i) => `${i + 1}. ${text}`).join(" ")} ${notes.join(" ")}`,
  groups: [
    box(cloud, C.cloud, "group-aws-cloud", "AWS Cloud"),
    box(home, C.account, "group-aws-account", "AWS Account · where Cloud Detective runs"),
    box(region, C.region, "group-region", "AWS Region · us-east-1", "6 5"),
    box(members, C.account, "group-aws-account", "Member accounts (optional)"),
  ],
  paths,
  junctions: [[J, n.scanner.y]],
  nodes: Object.entries(spec).map(([id, [, , iconName, title, detail]]) => ({ ...n[id], icon: iconName, title, detail })),
  steps,
  legend: { x: cloud.x, top: legendTop, items: legend, dashedKey, notes },
}));
