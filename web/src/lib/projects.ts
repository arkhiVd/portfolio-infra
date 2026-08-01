/**
 * The project set. Single source for both the home page (featured) and /projects.
 *
 * Copy is carried over from the v2 site, which was written from the repos themselves.
 * Every `metric` states something checkable — a count, a property of the architecture —
 * never a rounded-up or aspirational number (DESIGN.md § Content rules).
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
  /** one checkable fact, shown on the card */
  metric: string;
  /** architecture diagram at the site root, or null when there is none */
  image: string | null;
  imageAlt: string;
  repo: string | null;
  /** path under the site base once the deep dive exists (Phases 5-6) */
  caseStudy: string | null;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: "clearsky",
    name: "ClearSky — multi-account AWS posture & cost platform",
    status: "completed",
    summary:
      "Deterministic, read-only detectors scan every enabled region daily; findings live a full lifecycle in DynamoDB behind a Cognito dashboard. An agentic AI investigator queries the live account through a read-only tool-use loop, and member accounts onboard by cross-account assume-role.",
    stack: ["Lambda", "DynamoDB", "Cognito", "CloudFront", "Terraform"],
    metric: "113 unit tests",
    image: "/assets/img/clearsky-architecture.png",
    imageAlt:
      "ClearSky architecture: CloudFront and Cognito in front of Lambda function URLs, DynamoDB, EventBridge and cross-account IAM roles",
    repo: "https://github.com/arkhiVd/clearsky",
    caseStudy: null,
    featured: true,
  },
  {
    slug: "cloud-detective",
    name: "Cloud Detective — cost, inventory and posture scanner",
    status: "completed",
    summary:
      "The system ClearSky grew out of: a serverless scanner for AWS cost, inventory and security posture, with an agentic AI layer and a generator that draws a data-flow architecture diagram from what it finds in the account. Multi-account onboarding is driven from the dashboard through an SSM registry.",
    stack: ["Lambda", "DynamoDB", "CloudFront", "Terraform", "GitHub Actions"],
    metric: "106 tests",
    image: null,
    imageAlt: "",
    repo: "https://github.com/arkhiVd/cloud-detective",
    caseStudy: null,
    featured: false,
  },
  {
    slug: "appstack",
    name: "Microservices platform infrastructure",
    status: "completed",
    summary:
      "Modular Terraform for a .NET product platform. Eight services plus PDF-ingest and search-sync workers run on ECS-on-EC2 behind an ALB, split into a synchronous request path and an async S3 → SQS event path, every queue with a dead-letter queue.",
    stack: ["ECS on EC2", "RDS", "OpenSearch", "SQS", "Terraform"],
    metric: "no NAT gateway",
    image: "/assets/img/appstack-architecture.png",
    imageAlt:
      "AppStack architecture: ALB in front of ECS on EC2, with RDS Postgres, Redis, OpenSearch and SQS workers inside one VPC",
    repo: "https://github.com/arkhiVd/appstack-infra",
    caseStudy: null,
    featured: true,
  },
  {
    slug: "cdc",
    name: "Change data capture pipeline",
    status: "in progress",
    summary:
      "Every INSERT, UPDATE and DELETE on RDS PostgreSQL is streamed into Amazon MSK by a Debezium connector on MSK Connect — read straight from the write-ahead log, no polling. An S3 gateway endpoint pulls the connector plugin, so the VPC needs no NAT gateway.",
    stack: ["RDS PostgreSQL", "Amazon MSK", "Debezium", "Terraform"],
    metric: "log-based, not polled",
    image: "/assets/img/cdc-architecture.png",
    imageAlt:
      "CDC pipeline architecture: RDS PostgreSQL write-ahead log streamed by Debezium on MSK Connect into Amazon MSK topics",
    repo: "https://github.com/arkhiVd/cdc-infra",
    caseStudy: null,
    featured: true,
  },
  {
    slug: "portfolio",
    name: "This site",
    status: "live",
    summary:
      "A single Terraform stack: private S3 behind CloudFront with origin access control and a custom domain, plus a Python Lambda and DynamoDB behind a function URL powering the visitor counter. Shipped by keyless OIDC pipelines with remote state and a branch-protected plan/apply split.",
    stack: ["CloudFront", "S3", "Lambda", "DynamoDB", "Terraform", "Astro"],
    metric: "keyless OIDC deploys",
    image: null,
    imageAlt: "",
    repo: "https://github.com/arkhiVd/portfolio-infra",
    caseStudy: null,
    featured: false,
  },
  {
    slug: "cicd-containers",
    name: "CI/CD for AWS container services",
    status: "live",
    summary:
      "Two pipelines deploying the same containerized Python app onto different architectures: a production-shaped ECS Fargate environment behind an Application Load Balancer with networking in Terraform, and a serverless App Runner pipeline with automated deploys and SSL. Both authenticate to AWS by keyless OIDC.",
    stack: ["ECS Fargate", "App Runner", "Docker", "Terraform"],
    metric: "two architectures, one app",
    image: null,
    imageAlt: "",
    repo: "https://github.com/arkhiVd/aws-ecs-containerized-webapp",
    caseStudy: null,
    featured: false,
  },
  {
    slug: "homelab-sync",
    name: "Self-hosted encrypted sync service",
    status: "live",
    summary:
      "A private, end-to-end encrypted, real-time sync service on a headless Arch Linux server — a containerized CouchDB orchestrated with Docker Compose, hardened at the network layer with iptables rules written against Docker's own chains rather than around them.",
    stack: ["Arch Linux", "Docker Compose", "CouchDB", "iptables"],
    metric: "end-to-end encrypted",
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
      "Python and Netmiko automating configuration backups for network devices in a simulated GNS3 environment, with every change versioned in Git — a practical bridge between the CCNA side and infrastructure automation.",
    stack: ["Python", "Netmiko", "GNS3", "Git"],
    metric: "every change versioned",
    image: null,
    imageAlt: "",
    repo: null,
    caseStudy: null,
    featured: false,
  },
];

export const featured = projects.filter((p) => p.featured);
