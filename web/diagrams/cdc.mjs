// CDC pipeline architecture in the AWS reference-architecture style.
// Graph source of truth: arkhiVd/cdc-infra docs/architecture.drawio (7 edges, its numbered flow
// ① to ⑦). Facts come from the repo's Terraform where the drawing is stale: the VPC is a dedicated
// aws_vpc.main (the drawing still says "Default VPC"); the RDS subnet group, the MSK brokers and
// MSK Connect span both public subnets; and the IAM role is not bucket-scoped, because main.tf does
// not pass plugin_bucket_arn, so S3 read falls back to "*". Resource names assume project_name "lab".
// Run: node web/diagrams/cdc.mjs > web/public/assets/img/cdc-architecture.svg
import { C, ports, render } from "./aws-diagram.mjs";

const col = [90, 340, 600, 860];
const row = [0, 220, 400, 580];
const LA = (col[1] + col[2]) / 2; // the IAM role's lane
const LB = (col[2] + col[3]) / 2; // the log lane

// [x, y, icon, title, detail]
const spec = {
  dev: [col[0], row[1], "client", "Developer laptop"],
  rds: [col[1], row[1], "rds", "Amazon RDS", ["PostgreSQL 18 · db.t4g.micro", "wal_level=logical, public"]],
  connect: [col[2], row[1], "msk-connect", "Amazon MSK Connect", ["Debezium 2.7.4", "1 MCU · 1 worker"]],
  msk: [col[3], row[1], "msk", "Amazon MSK", ["2 × kafka.t3.small", "PLAINTEXT :9092", "topic rds.public.users"]],
  vpce: [col[2], row[2], "vpc-endpoints", "S3 gateway endpoint", "free · no NAT, no internet"],
  iam: [col[1], row[3], "iam-role", "IAM role", ["lab-MSKConnectRole", "S3 read + CloudWatch Logs"]],
  s3: [col[2], row[3], "s3", "Amazon S3", "Debezium plugin ZIP"],
  cw: [col[3], row[3], "cloudwatch", "Amazon CloudWatch Logs", "/msk-connect/lab-debezium"],
};
const n = Object.fromEntries(Object.entries(spec).map(([id, [x, y, , , detail]]) =>
  [id, ports(x, y, detail === undefined ? 1 : [].concat(detail).length)]));

const paths = [];
const steps = [];
const line = (points, dashed = false) => paths.push({ points, dashed, arrow: true });
const step = (num, x, y) => steps.push({ n: num, x, y });

// The source's numbered flow, ① to ⑦.
line([n.dev.R, n.rds.L]);
step(1, (n.dev.R[0] + n.rds.L[0]) / 2, n.dev.y - 18);
line([n.rds.R, [n.connect.L[0], n.rds.y]]);
step(2, (n.rds.R[0] + n.connect.L[0]) / 2, n.rds.y - 18);
line([n.connect.R, n.msk.L]);
step(3, (n.connect.R[0] + n.msk.L[0]) / 2, n.connect.y - 18);
line([n.connect.B, n.vpce.T], true);
step(4, n.connect.x + 22, (n.connect.B[1] + n.vpce.T[1]) / 2);
line([n.vpce.B, n.s3.T], true);
step(5, n.vpce.x + 22, (n.vpce.B[1] + n.s3.T[1]) / 2);
line([[n.connect.R[0], n.connect.y + 18], [LB, n.connect.y + 18], [LB, n.cw.y], n.cw.L], true);
step(6, LB + 22, (row[2] + 104 + n.cw.T[1]) / 2);
line([n.iam.R, [LA, n.iam.y], [LA, n.connect.y + 18], [n.connect.L[0], n.connect.y + 18]], true);
step(7, LA - 22, (row[2] + 104 + n.iam.T[1]) / 2);

const legend = [
  "The developer seeds and queries RDS over psql on port 5432 (publicly accessible).",
  "Debezium reads the write-ahead log by logical decoding (pgoutput) through the replication slot 'debezium'.",
  "MSK Connect produces CDC JSON to the Kafka topic rds.public.users on MSK.",
  "The connector pulls its plugin through the S3 gateway endpoint,",
  "which serves the Debezium ZIP from S3 with no NAT gateway or internet path.",
  "Connector workers send their logs to CloudWatch Logs.",
  "The IAM role, granting S3 read and CloudWatch Logs access, is the connector's service execution role.",
];
const dashedKey = "Dashed lines are the control plane: plugin download, logs and the execution role.";
const notes = [
  "One security group: self-referencing between the services, plus the developer's /32 on 5432 and 9092.",
  "PLAINTEXT on 9092 is a lab setting.",
];

const cloud = { x: 190, y: 20, r: 1020, b: row[3] + 130 };
const region = { x: 210, y: 60, r: 1000, b: cloud.b - 16 };
const vpc = { x: 230, y: 100, r: 980, b: row[2] + 104 };
const pub = { x: 245, y: 142, r: 965, b: row[1] + 140 };
const width = 1040;
const legendTop = cloud.b + 44;
const height = legendTop + (legend.length + 1 + notes.length) * 32 + 20;
const box = (g, stroke, icon, label, dash) => ({ x: g.x, y: g.y, w: g.r - g.x, h: g.b - g.y, stroke, icon, label, dash });

process.stdout.write(render({
  width, height,
  title: `Change data capture pipeline architecture on AWS. ${legend.map((text, i) => `${i + 1}. ${text}`).join(" ")} ${notes.join(" ")}`,
  groups: [
    box(cloud, C.cloud, "group-aws-cloud", "AWS Cloud"),
    box(region, C.region, "group-region", "AWS Region · us-east-1", "6 5"),
    box(vpc, C.vpc, "group-vpc", "VPC (dedicated, managed by Terraform)"),
    box(pub, C.publicSubnet, "group-public-subnet", "Public subnets · 2 AZs (RDS subnet group, MSK brokers and MSK Connect span both)"),
  ],
  paths,
  nodes: Object.entries(spec).map(([id, [, , iconName, title, detail]]) => ({ ...n[id], icon: iconName, title, detail })),
  steps,
  legend: { x: cloud.x, top: legendTop, items: legend, dashedKey, notes },
}));
