/**
 * The project set. Single source for both the home page (featured) and /projects.
 *
 * Copy is sourced from the public repositories and project notes. Cards stay concise;
 * detailed evidence and numbers belong in each case study.
 *
 * `caseStudy` points at a deep dive; projects without one are listed with their repo and
 * are never linked to a page that does not exist.
 */
export interface Project {
  slug: string;
  name: string;
  status: "live" | "completed" | "in progress";
  summary: string;
  stack: string[];
  /** architecture diagram at the site root, or null when there is none */
  image: string | null;
  imageAlt: string;
  repo: string | null;
  secondaryRepo?: { label: string; url: string };
  /** path under the site base once the deep dive exists (Phases 5-6) */
  caseStudy: string | null;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: "clearsky",
    name: "ClearSky — AWS posture and cost platform",
    status: "completed",
    summary:
      "Scans multiple AWS accounts for security, cost and inventory findings. Deterministic detectors create the findings; a read-only AI investigator explains them without changing resources.",
    stack: ["Lambda", "DynamoDB", "Cognito", "CloudFront", "Terraform"],
    image: "/assets/img/clearsky-architecture.png",
    imageAlt:
      "ClearSky architecture: CloudFront and Cognito in front of Lambda function URLs, DynamoDB, EventBridge and cross-account IAM roles",
    repo: "https://github.com/arkhiVd/clearsky",
    caseStudy: "/projects/clearsky",
    featured: true,
  },
  {
    slug: "appstack",
    name: "Microservices platform infrastructure",
    status: "in progress",
    summary:
      "Terraform infrastructure for eight .NET services and two background workers on ECS. The design separates request traffic from S3 and SQS event processing and avoids a NAT gateway.",
    stack: ["ECS on EC2", "RDS", "OpenSearch", "SQS", "Terraform"],
    image: "/assets/img/appstack-architecture.png",
    imageAlt:
      "AppStack architecture: ALB in front of ECS on EC2, with RDS Postgres, Redis, OpenSearch and SQS workers inside one VPC",
    repo: "https://github.com/arkhiVd/appstack-infra",
    caseStudy: "/projects/appstack",
    featured: true,
  },
  {
    slug: "cdc",
    name: "Change data capture pipeline",
    status: "in progress",
    summary:
      "Streams PostgreSQL changes from the write-ahead log into Amazon MSK with Debezium on MSK Connect. An S3 gateway endpoint supplies the connector plugin without a NAT gateway.",
    stack: ["RDS PostgreSQL", "Amazon MSK", "Debezium", "Terraform"],
    image: "/assets/img/cdc-architecture.png",
    imageAlt:
      "CDC pipeline architecture: RDS PostgreSQL write-ahead log streamed by Debezium on MSK Connect into Amazon MSK topics",
    repo: "https://github.com/arkhiVd/cdc-infra",
    caseStudy: "/projects/cdc",
    featured: true,
  },
  {
    slug: "portfolio",
    name: "Cloud portfolio infrastructure",
    status: "live",
    summary:
      "Runs this site from private S3 behind CloudFront and counts visitors with Lambda and DynamoDB. Terraform and separate OIDC plan and apply workflows manage the stack.",
    stack: ["CloudFront", "S3", "Lambda", "DynamoDB", "Terraform", "Astro"],
    image: "/assets/img/architecture-diagram.png",
    imageAlt: "Portfolio architecture: CloudFront serves private S3 content and routes visitor requests to Lambda and DynamoDB",
    repo: "https://github.com/arkhiVd/portfolio-infra",
    caseStudy: "/projects/portfolio",
    featured: false,
  },
  {
    slug: "cicd-containers",
    name: "CI/CD for AWS container services",
    status: "live",
    summary:
      "Deploys the same containerized Python application to ECS Fargate and App Runner. Both pipelines use Terraform for infrastructure and OIDC instead of stored AWS credentials.",
    stack: ["ECS Fargate", "App Runner", "Docker", "Terraform"],
    image: "/assets/img/containers-architecture.png",
    imageAlt: "Container application architecture: an Application Load Balancer routes traffic to ECS Fargate tasks in private subnets",
    repo: "https://github.com/arkhiVd/aws-ecs-containerized-webapp",
    secondaryRepo: {
      label: "App Runner source",
      url: "https://github.com/arkhiVd/aws-apprunner-containerized-webapp",
    },
    caseStudy: "/projects/cicd-containers",
    featured: false,
  },
  {
    slug: "cloud-detective",
    name: "Cloud Detective — AWS account scanner",
    status: "completed",
    summary:
      "The project that preceded ClearSky. It scans AWS cost, inventory and security posture, tracks findings over time, and generates architecture diagrams from discovered resources.",
    stack: ["Lambda", "DynamoDB", "CloudFront", "Terraform", "GitHub Actions"],
    image: null,
    imageAlt: "",
    repo: "https://github.com/arkhiVd/cloud-detective",
    caseStudy: "/projects/cloud-detective",
    featured: false,
  },
  {
    slug: "homelab-sync",
    name: "Self-hosted encrypted sync service",
    status: "live",
    summary:
      "Runs an encrypted note-sync service on a headless Arch Linux server. CouchDB is deployed with Docker Compose and restricted with rules applied through Docker's iptables chains.",
    stack: ["Arch Linux", "Docker Compose", "CouchDB", "iptables"],
    image: null,
    imageAlt: "",
    repo: null,
    caseStudy: null,
    featured: false,
  },
  {
    slug: "net-automation",
    name: "Network automation scripts",
    status: "in progress",
    summary:
      "Uses Python and Netmiko to back up network-device configurations in a GNS3 lab. Each backup is stored in Git so configuration changes can be reviewed over time.",
    stack: ["Python", "Netmiko", "GNS3", "Git"],
    image: null,
    imageAlt: "",
    repo: null,
    caseStudy: null,
    featured: false,
  },
];

export const featured = projects.filter((p) => p.featured);
