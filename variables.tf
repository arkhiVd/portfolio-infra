variable "aws_region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Globally unique name for the S3 bucket that holds the static site (fronted by CloudFront; name need not match the domain)."
  type        = string
  default     = "aravindakrishnan-portfolio-site"
}

variable "domain_name" {
  description = "Apex custom domain. Empty = serve from the default *.cloudfront.net cert with no aliases."
  type        = string
  default     = "aravindakrishnan.cloud"
}

variable "allowed_origins" {
  description = "Origins allowed to call the visitor counter Function URL (locked to the live site origins)."
  type        = list(string)
  default = [
    "https://www.aravindakrishnan.cloud",
    "https://aravindakrishnan.cloud"
  ]
}

variable "ip_hash_secret" {
  description = "A secret salt used for hashing visitor IP addresses."
  type        = string
  sensitive   = true
}
