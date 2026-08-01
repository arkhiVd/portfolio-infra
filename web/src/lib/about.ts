/**
 * About-page content, sourced from ~/Documents/resume/resume.tex (the canonical resume).
 *
 * NOTE — unresolved: the resume names the employer **Zarthi**; the published site says
 * **Centilytics**. This file keeps what the live site currently says so the rebuild does
 * not silently change a fact about Aravind's job. Resolve in SPEC.md, then change here.
 */

export const employer = "Centilytics";

export interface Role {
  title: string;
  org: string;
  period: string;
  location: string;
  points: string[];
}

export const experience: Role[] = [
  {
    title: "Cloud Engineer",
    org: employer,
    period: "Oct 2025 — present",
    location: "Remote, India",
    points: [
      "Operate AWS infrastructure for 10+ enterprise customers across healthcare, automotive and SaaS, keeping production and development environments available.",
      "Provision and administer Linux and Windows EC2 fleets across prod, dev and test — AMIs, key pairs, EBS snapshots, right-sizing — and resolve incidents through log analysis and request tracing.",
      "Strengthened security posture across 10+ AWS accounts with least-privilege IAM and org-wide MFA.",
      "Designed VPC networking for 10+ customer environments: subnets, route tables, Internet and NAT gateways, NACLs, security groups, peering, and site-to-site VPN to on-prem data centres.",
      "Automated backups with AWS Backup plus Lambda-driven snapshot cleanup, replacing a recurring manual snapshot-hygiene task and cutting storage spend.",
      "Instrumented 30+ CloudWatch alarms and Grafana dashboards, so incidents surface from alerts rather than from customer reports.",
      "Reduced monthly spend through Savings Plans and Reserved Instance analysis, storage-class tuning and right-sizing.",
    ],
  },
];

export interface Certification {
  name: string;
  issuer: string;
  verify: string;
}

/** Rendered as uniform mono-line lockups — never vendor badge PNGs (DESIGN.md). */
export const certifications: Certification[] = [
  {
    name: "AWS Certified Solutions Architect – Associate",
    issuer: "Amazon Web Services",
    verify:
      "https://www.credly.com/badges/f80f390f-8aaa-4828-9f45-fa34bd2fb81b/public_url",
  },
  {
    name: "Cisco Certified Network Associate (CCNA)",
    issuer: "Cisco",
    verify:
      "https://www.credly.com/badges/5aaa037e-bf4c-4eb4-8f24-64ccbf8e3b04/public_url",
  },
];

export const skills: { label: string; items: string }[] = [
  {
    label: "cloud",
    items:
      "EC2 · VPC · S3 · IAM · Lambda · DynamoDB · RDS · CloudFront · ECS/Fargate · App Runner · Route 53 · CloudWatch · WAF · SQS · OpenSearch · ELB · Auto Scaling",
  },
  { label: "iac & ci/cd", items: "Terraform · GitHub Actions · OIDC · Ansible" },
  { label: "containers", items: "Docker · Kubernetes · ECS · Fargate" },
  { label: "languages", items: "Python · Bash · SQL · JavaScript" },
  { label: "os & networking", items: "Linux · Nginx · VPC · VPN · GNS3" },
  { label: "monitoring", items: "CloudWatch · Grafana" },
];

export const education = {
  school: "Govt. Model Engineering College",
  place: "Kochi, Kerala",
  finished: "June 2025",
  degree: "B.Tech, Electronics & Communication Engineering",
};
