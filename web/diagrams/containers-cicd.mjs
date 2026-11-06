// CI/CD for containers: the deployment pipeline, in the AWS reference-architecture style.
// Source of truth: arkhiVd/aws-ecs-containerized-webapp .github/workflows/deploy.yml and iac/main.tf.
// The workflow runs on workflow_dispatch (a manual run since commit 081a76d); the older PNG still
// showed a git push trigger.
// Run: node web/diagrams/containers-cicd.mjs > web/public/assets/img/containers-cicd.svg
import { C, ports, render } from "./aws-diagram.mjs";

const col = [90, 310, 550, 790];
const row = [0, 180, 460, 640];
const yPull = row[3] + 130; // ECR to ECS, under the state bucket

// [x, y, icon, title, detail]
const spec = {
  dev: [col[0], row[1], "client", "Developer", "starts the workflow"],
  build: [col[1], row[1], "job", "Build and push", ["docker build, tag with", "the commit SHA, push"]],
  plan: [col[2], row[1], "job", "Terraform plan", "with the image URL"],
  apply: [col[3], row[1], "job", "Terraform apply", ["production environment", "-auto-approve"]],
  role: [col[2], row[2], "iam-role", "IAM role", ["GitHubActions_ECS_Role", "assumed through OIDC"]],
  ecr: [col[1], row[3], "ecr", "Amazon ECR", ["demo-assignment-repo", "tag = commit SHA"]],
  state: [col[2], row[3], "s3", "Amazon S3", "Terraform state backend"],
  task: [col[3], row[3], "fargate", "AWS Fargate", ["ECS service", "new task-definition revision"]],
};
const n = Object.fromEntries(Object.entries(spec).map(([id, [x, y, , , detail]]) =>
  [id, ports(x, y, detail === undefined ? 1 : [].concat(detail).length)]));

const paths = [];
const steps = [];
const line = (points, dashed = false) => paths.push({ points, dashed, arrow: true });
const step = (num, x, y) => steps.push({ n: num, x, y });

// 1 · a manual run; the jobs run in order (needs).
line([n.dev.R, n.build.L]);
step(1, n.dev.R[0] + 36, n.dev.y - 18); // left of the GitHub box
line([n.build.R, n.plan.L]);
step(4, (n.build.R[0] + n.plan.L[0]) / 2, n.build.y - 18);
line([n.plan.R, n.apply.L]);
// 2 · every job assumes the role through OIDC.
line([[n.build.x + 14, n.build.B[1]], [n.build.x + 14, n.role.y], n.role.L], true);
line([n.plan.B, n.role.T], true);
line([[n.apply.x - 14, n.apply.B[1]], [n.apply.x - 14, n.role.y], n.role.R], true);
step(2, n.plan.x + 22, row[1] + 150); // between the GitHub and AWS Cloud boxes
// 3 · push the SHA-tagged image.
line([[n.build.x - 14, n.build.B[1]], [n.build.x - 14, n.ecr.T[1]]]);
step(3, n.build.x - 40, (n.role.y + n.ecr.T[1]) / 2);
// 5 · apply updates the service.
line([[n.apply.x + 14, n.apply.B[1]], [n.apply.x + 14, n.task.T[1]]]);
step(5, n.apply.x + 40, (n.role.y + n.task.T[1]) / 2);
// 6 · Fargate pulls the image.
line([n.ecr.B, [n.ecr.x, yPull], [n.task.x, yPull], n.task.B]);
step(6, (n.ecr.x + n.task.x) / 2 + 60, yPull);

const legend = [
  "A developer starts deploy.yml by hand (workflow_dispatch).",
  "Each job assumes GitHubActions_ECS_Role through OIDC, so no AWS keys are stored.",
  "Build and push: Docker builds the image, tags it with the commit SHA and pushes it to ECR.",
  "Terraform plan receives that image URL.",
  "Terraform apply, in the production environment, registers a new task definition and updates the service.",
  "Fargate pulls the commit-SHA-tagged image from ECR.",
];
const dashedKey = "Dashed lines: each job assuming the OIDC role.";
const notes = [
  "Plan and apply keep Terraform state in an S3 backend.",
  "A separate destroy workflow removes the Terraform-managed stack after a typed confirmation.",
];

const github = { x: 200, y: 40, r: 900, b: row[1] + 130 };
const cloud = { x: 40, y: row[1] + 170, r: 900, b: yPull + 40 };
const region = { x: 58, y: cloud.y + 40, r: 882, b: cloud.b - 16 };
const width = 920;
const legendTop = cloud.b + 44;
const height = legendTop + (legend.length + 1 + notes.length) * 32 + 20;
const box = (g, stroke, icon, label, dash) => ({ x: g.x, y: g.y, w: g.r - g.x, h: g.b - g.y, stroke, icon, label, dash });

process.stdout.write(render({
  width, height,
  title: `CI/CD for AWS container services: deployment pipeline. ${legend.map((text, i) => `${i + 1}. ${text}`).join(" ")} ${notes.join(" ")}`,
  groups: [
    box(github, "#8C95A1", "git-repository", "GitHub Actions · deploy.yml (manual trigger)"),
    box(cloud, C.cloud, "group-aws-cloud", "AWS Cloud"),
    box(region, C.region, "group-region", "AWS Region · ap-south-1", "6 5"),
  ],
  paths,
  nodes: Object.entries(spec).map(([id, [, , iconName, title, detail]]) => ({ ...n[id], icon: iconName, title, detail })),
  steps,
  legend: { x: 40, top: legendTop, items: legend, dashedKey, notes },
}));
