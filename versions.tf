terraform {
  required_version = ">= 1.10.0"

  # Remote state in S3 (bucket created by bootstrap/). Native S3 locking
  # (use_lockfile) — no DynamoDB lock table needed (Terraform >= 1.10).
  backend "s3" {
    bucket       = "portfolio-tfstate-486539985928-us-east-1"
    key          = "portfolio-infra/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "portfolio"
      ManagedBy = "Terraform"
    }
  }
}
