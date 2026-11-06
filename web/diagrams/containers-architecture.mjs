// CI/CD for containers: the application architecture, in the AWS reference-architecture style.
// Source of truth: arkhiVd/aws-ecs-containerized-webapp iac/*.tf (the repo has no diagram
// source, only an older PNG). The tasks run in the two public subnets with public IPs; the old
// PNG showed private subnets, which the Terraform does not create.
// Run: node web/diagrams/containers-architecture.mjs > web/public/assets/img/containers-architecture.svg
import { C, ports, render } from "./aws-diagram.mjs";

const col = [90, 290, 500, 740, 980];
const row = [0, 270, 500];
const lane = (col[2] + col[3]) / 2; // the execution role's lane, between the ALB and the cluster

// [x, y, icon, title, detail]
const spec = {
  users: [col[0], row[1], "users", "Users", "browser"],
  igw: [col[1], row[1], "internet-gateway", "Internet gateway"],
  alb: [col[2], row[1], "alb", "Elastic Load Balancing", ["Application Load Balancer", "internet-facing · HTTP :80"]],
  task: [col[3], row[1], "fargate", "AWS Fargate", ["ECS service · 1 task", "Flask container :8080", "0.25 vCPU · 512 MiB · public IP"]],
  logs: [col[4], row[1], "cloudwatch", "Amazon CloudWatch Logs", "/ecs/demo-app"],
  role: [col[2], row[2], "iam-role", "IAM role", ["ECS task execution role", "AmazonECSTaskExecutionRolePolicy"]],
  ecr: [col[3], row[2], "ecr", "Amazon ECR", ["demo-assignment-repo", "commit-SHA image tags"]],
};
const n = Object.fromEntries(Object.entries(spec).map(([id, [x, y, , , detail]]) =>
  [id, ports(x, y, detail === undefined ? 1 : [].concat(detail).length)]));

const paths = [];
const steps = [];
const line = (points, dashed = false) => paths.push({ points, dashed, arrow: true });
const step = (num, x, y) => steps.push({ n: num, x, y });

line([n.users.R, n.igw.L]);
line([n.igw.R, n.alb.L]);
step(1, n.users.R[0] + 26, n.users.y - 18); // left of the AWS Cloud edge
line([n.alb.R, n.task.L]);
step(2, (n.alb.R[0] + lane) / 2, n.alb.y - 18);
line([n.task.R, n.logs.L]);
step(3, n.logs.L[0] - 38, n.task.y - 18); // past the VPC edge
line([n.ecr.T, n.task.B]);
step(4, n.ecr.x + 22, n.ecr.T[1] - 19); // under the VPC edge
line([n.role.R, [lane, n.role.y], [lane, n.task.y + 18], [n.task.L[0], n.task.y + 18]], true);
step(5, lane - 22, n.role.y - 40); // under the VPC edge

const legend = [
  "Users reach the internet-facing Application Load Balancer over HTTP on port 80.",
  "The ALB forwards to the task's IP on port 8080; the task's security group admits only the ALB's group.",
  "The container sends its logs to CloudWatch Logs through the awslogs driver.",
  "Fargate pulls the commit-SHA-tagged image from ECR.",
  "The task execution role lets ECS pull that image and write the logs.",
];
const dashedKey = "Dashed line: the execution role ECS uses for the task; the app itself has no IAM role.";
const notes = [
  "The service places its one task in one of two public subnets, with a public IP and no NAT gateway.",
  "Security groups keep it reachable only from the ALB.",
];

const cloud = { x: 180, y: 20, r: 1100, b: row[2] + 120 };
const region = { x: 200, y: 60, r: 1080, b: cloud.b - 16 };
const vpc = { x: 220, y: 100, r: 872, b: row[1] + 150 };
const pub = { x: 352, y: 140, r: 860, b: row[1] + 136 };
const ecs = { x: 636, y: 180, r: 846, b: row[1] + 124 };
const width = 1120;
const legendTop = cloud.b + 44;
const height = legendTop + (legend.length + 1 + notes.length) * 32 + 20;
const box = (g, stroke, icon, label, dash) => ({ x: g.x, y: g.y, w: g.r - g.x, h: g.b - g.y, stroke, icon, label, dash });

process.stdout.write(render({
  width, height,
  title: `CI/CD for AWS container services: application architecture on AWS. ${legend.map((text, i) => `${i + 1}. ${text}`).join(" ")} ${notes.join(" ")}`,
  groups: [
    box(cloud, C.cloud, "group-aws-cloud", "AWS Cloud"),
    box(region, C.region, "group-region", "AWS Region · ap-south-1", "6 5"),
    box(vpc, C.vpc, "group-vpc", "VPC 10.0.0.0/16"),
    box(pub, C.publicSubnet, "group-public-subnet", "Public subnets · 1a, 1b"),
    box(ecs, C.ecs, "ecs", "ECS cluster", "6 5"),
  ],
  paths,
  nodes: Object.entries(spec).map(([id, [, , iconName, title, detail]]) => ({ ...n[id], icon: iconName, title, detail })),
  steps,
  legend: { x: cloud.x, top: legendTop, items: legend, dashedKey, notes },
}));
