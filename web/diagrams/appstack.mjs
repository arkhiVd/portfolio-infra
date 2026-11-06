// AppStack (microservices platform) architecture in the AWS reference-architecture style.
// Graph source of truth: arkhiVd/appstack-infra docs/architecture.drawio (16 edges). Six of its
// edges have floating endpoints; each one touches exactly one node, which is the node used here.
// Run: node web/diagrams/appstack.mjs > web/public/assets/img/appstack-architecture.svg
import { C, ports, render } from "./aws-diagram.mjs";

const X = { users: 80, edge: 255, alb: 500, ecs: 690, data: 895, sqs: 1112, right: 1280 };
const L1 = 797; // services lane, between the public and private subnets
const L2a = 997, L2b = 1017; // workers' lanes, between the private subnets and the queues
const row = [90, 260, 420, 640, 790, 940, 1090];
const yBot = 1215; // workers' trunk, under the ECS cluster
const yGw = 1290;

// [x, y, icon, title, detail]
const spec = {
  users: [X.users, row[3], "users", "Internet users", "users · admin"],
  gha: [X.right, row[0], "git-repository", "GitHub Actions", "CI/CD via OIDC, no static keys"],
  spa: [X.edge, row[1], "s3", "Amazon S3", "admin SPA (private, OAC)"],
  cf: [X.edge, row[2], "cloudfront", "Amazon CloudFront"],
  tfstate: [X.sqs, row[1], "s3", "Amazon S3", ["tfstate", "versioned, encrypted"]],
  oidc: [X.right, row[1], "iam", "AWS IAM", ["OIDC roles: plan (read-only),", "apply (PowerUser + scoped IAM)"]],
  ecr: [X.sqs, row[2], "ecr", "Amazon ECR"],
  lock: [X.right, row[2], "dynamodb", "Amazon DynamoDB", "Terraform state lock"],
  alb: [X.alb, row[3], "alb", "Elastic Load Balancing", "Application Load Balancer"],
  hosts: [X.ecs, row[3], "ec2", "Amazon EC2", "3 container hosts"],
  redis: [X.data, row[3], "elasticache", "Amazon ElastiCache", "Redis 7 · cache.t3.micro"],
  svc: [X.ecs, row[4], "ecs-service", "Microservices", ["auth · user · kyc · business", "finance · subscription", "notification · integration"]],
  rds: [X.data, row[4], "rds", "Amazon RDS", ["PostgreSQL 16", "db.t3.micro · 20 GiB"]],
  sqsp: [X.sqs, row[4], "sqs", "Amazon SQS", "price-sync (+ DLQ)"],
  obs: [X.ecs, row[5], "ecs-service", "Observability", "Prometheus · Grafana"],
  os: [X.data, row[5], "opensearch", "Amazon OpenSearch", "t3.small.search · 1 node"],
  wkr: [X.ecs, row[6], "ecs-service", "Workers", ["pdf-ingest-worker", "search-sync-worker"]],
  sqspdf: [X.sqs, row[6], "sqs", "Amazon SQS", "pdf-sync (+ DLQ)"],
  s3pdf: [X.right, row[6], "s3", "Amazon S3", ["PDF ingest (private)", "admin uploads PDFs here"]],
  gw: [X.data, yGw, "vpc-endpoints", "Gateway endpoints", ["S3 + DynamoDB (free)", "no NAT gateway"]],
};
const n = Object.fromEntries(Object.entries(spec).map(([id, [x, y, , , detail]]) =>
  [id, ports(x, y, detail === undefined ? 1 : [].concat(detail).length)]));

const paths = [];
const steps = [];
const line = (points, dashed = false, arrow = true) => paths.push({ points, dashed, arrow });
const step = (num, x, y) => steps.push({ n: num, x, y });

// 1 · the admin SPA through CloudFront.
line([n.users.T, [n.users.x, n.cf.y], n.cf.L]);
line([n.cf.T, n.spa.B]);
step(1, n.users.x + 22, (n.users.T[1] + n.cf.y) / 2);
// 2 · HTTPS 443 to the ALB, HTTP to the ECS hosts.
line([n.users.R, n.alb.L]);
line([n.alb.R, n.hosts.L]);
step(2, X.edge, n.users.y - 18);
// 3 · the microservices fan out to the data tier from one lane.
const band = row[3] - 50; // above the Redis row, for the publish to SQS
line([n.svc.R, [L1, n.svc.y]], false, false);
line([[L1, band], [L1, n.os.y]], false, false);
line([[L1, n.redis.y], n.redis.L]);
line([[L1, n.rds.y], n.rds.L]);
line([[L1, n.os.y], n.os.L]);
step(3, L1 + 26, n.rds.y - 18);
// 4 · publish to SQS price-sync.
line([[L1, band], [n.sqsp.x, band], n.sqsp.T]);
step(4, n.sqsp.x - 50, band);
// 5 · PDF uploads raise ObjectCreated events on SQS pdf-sync.
line([n.s3pdf.L, n.sqspdf.R]);
step(5, (n.sqspdf.R[0] + n.s3pdf.L[0]) / 2, n.sqspdf.y - 18);
// 6 · the workers fan out along one trunk under the cluster.
line([n.wkr.B, [n.wkr.x, yBot], [n.sqspdf.x, yBot]], false, false);
line([[n.os.x, yBot], n.os.B]);
line([[L2a, yBot], [L2a, n.rds.y], n.rds.R], true); // batch insert (dashed in the source)
line([[L2b, yBot], [L2b, n.sqsp.y], n.sqsp.L]);
line([[n.sqspdf.x, yBot], n.sqspdf.B]);
step(6, n.wkr.x + 60, yBot);
// 7 · the hosts pull images from ECR.
// Enters the hosts from the right so it clears the cluster's title.
const pull = n.hosts.x + 55;
line([n.ecr.L, [pull, n.ecr.y], [pull, n.hosts.y], n.hosts.R]);
step(7, X.data, n.ecr.y);
// 8 · delivery: OIDC roles, then terraform apply takes the state lock.
line([n.gha.B, n.oidc.T]);
line([n.oidc.B, n.lock.T], true);
step(8, n.gha.x + 22, n.gha.B[1] + 17);

const legend = [
  "Users load the admin SPA from a private S3 bucket through CloudFront (OAC).",
  "Users reach the Application Load Balancer on HTTPS 443; it forwards HTTP to the ECS hosts.",
  "The microservices use RDS PostgreSQL (5432), ElastiCache Redis (6379) and OpenSearch (443).",
  "The microservices publish to SQS price-sync.",
  "PDFs uploaded to the ingest bucket send ObjectCreated events to SQS pdf-sync.",
  "The workers consume both queues, batch-insert into RDS and update the OpenSearch index.",
  "The EC2 container hosts pull images from ECR.",
  "GitHub Actions assumes the OIDC roles; terraform apply holds the DynamoDB state lock.",
];
const dashedKey = "Dashed lines follow the source diagram: the workers' batch insert and terraform apply.";
const notes = ["Private subnets (1a / 1b) have no internet route: S3 and DynamoDB gateway endpoints replace a NAT gateway."];

const cloud = { x: 140, y: 200, r: 1410, b: yGw + 150 };
const region = { x: 350, y: 230, r: 1390, b: cloud.b - 16 };
const vpc = { x: 380, y: 500, r: 1040, b: cloud.b - 32 };
const pub = { x: 395, y: 525, r: 789, b: yBot - 14 };
const priv = { x: 805, y: 525, r: 978, b: cloud.b - 46 };
const ecs = { x: 588, y: row[3] - 55, r: 781, b: yBot - 24 };
const width = 1430;
const legendTop = cloud.b + 44;
const height = legendTop + (legend.length + 1 + notes.length) * 32 + 20;
const box = (g, stroke, icon, label, dash) => ({ x: g.x, y: g.y, w: g.r - g.x, h: g.b - g.y, stroke, icon, label, dash });

process.stdout.write(render({
  width, height,
  title: `Microservices platform (AppStack) architecture on AWS. ${legend.map((text, i) => `${i + 1}. ${text}`).join(" ")} ${notes.join(" ")}`,
  groups: [
    box(cloud, C.cloud, "group-aws-cloud", "AWS Cloud"),
    box(region, C.region, "group-region", "AWS Region · ap-south-1", "6 5"),
    box(vpc, C.vpc, "group-vpc", "VPC 10.0.0.0/16"),
    box(pub, C.publicSubnet, "group-public-subnet", "Public subnets"),
    box(priv, C.privateSubnet, "group-private-subnet", "Private subnets"),
    box(ecs, C.ecs, "ecs", "ECS cluster", "6 5"),
  ],
  paths,
  nodes: Object.entries(spec).map(([id, [, , iconName, title, detail]]) => ({ ...n[id], icon: iconName, title, detail })),
  steps,
  legend: { x: cloud.x, top: legendTop, items: legend, dashedKey, notes },
}));
