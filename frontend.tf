locals {
  mime_types = {
    "html" = "text/html",
    "css"  = "text/css",
    "js"   = "application/javascript",
    "jpeg" = "image/jpeg",
    "jpg"  = "image/jpeg",
    "png"  = "image/png",
    "ico"  = "image/vnd.microsoft.icon",
    "txt"  = "text/plain"
  }
}

# tfsec:ignore:aws-s3-enable-bucket-logging
# tfsec:ignore:aws-s3-enable-versioning
resource "aws_s3_bucket" "portfolio_bucket" {
  bucket = var.bucket_name
}

# tfsec:ignore:aws-s3-encryption-customer-key
resource "aws_s3_bucket_server_side_encryption_configuration" "portfolio_bucket_encryption" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_ownership_controls" "portfolio_ownership_controls" {
  bucket = aws_s3_bucket.portfolio_bucket.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "portfolio_public_access_block" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "portfolio_files" {
  for_each = fileset("${path.module}/site/", "**")

  bucket       = aws_s3_bucket.portfolio_bucket.id
  key          = each.value
  source       = "${path.module}/site/${each.value}"
  content_type = lookup(local.mime_types, regex("\\.(\\w+)$", each.value)[0], "binary/octet-stream")
  etag         = filemd5("${path.module}/site/${each.value}")
}

# Rendered separately so Terraform can inject the Lambda Function URL.
resource "aws_s3_object" "visitor_script" {
  bucket       = aws_s3_bucket.portfolio_bucket.id
  key          = "assets/js/visitorscript.js"
  content_type = "application/javascript"
  content = templatefile("${path.module}/templates/visitorscript.js.tftpl", {
    api_url = aws_lambda_function_url.counter_url.function_url
  })
}

resource "aws_cloudfront_origin_access_control" "portfolio_oac" {
  name                              = "OAC-${var.bucket_name}"
  description                       = "OAC for S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# tfsec:ignore:aws-cloudfront-enable-waf
# tfsec:ignore:aws-cloudfront-enable-logging
resource "aws_cloudfront_distribution" "portfolio_cdn" {
  origin {
    domain_name              = aws_s3_bucket.portfolio_bucket.bucket_regional_domain_name
    origin_id                = "S3-${var.bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.portfolio_oac.id
  }

  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  # Custom domain wiring is toggled by var.domain_name (empty = default cert only).
  aliases = var.domain_name == "" ? [] : [var.domain_name, "www.${var.domain_name}"]

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.bucket_name}"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  dynamic "viewer_certificate" {
    for_each = var.domain_name == "" ? [1] : []
    content {
      cloudfront_default_certificate = true
      minimum_protocol_version       = "TLSv1.2_2021"
    }
  }

  dynamic "viewer_certificate" {
    for_each = var.domain_name == "" ? [] : [1]
    content {
      acm_certificate_arn      = aws_acm_certificate_validation.portfolio_cert[0].certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
  }
}

resource "aws_s3_bucket_policy" "portfolio_bucket_policy" {
  bucket = aws_s3_bucket.portfolio_bucket.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = { Service = "cloudfront.amazonaws.com" },
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.portfolio_bucket.arn}/*",
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.portfolio_cdn.arn
          }
        }
      }
    ]
  })
}

# --- Custom domain: ACM cert (us-east-1, required for CloudFront), DNS-validated.
# Validation CNAMEs are output for you to add at Namecheap (no Route 53).
resource "aws_acm_certificate" "portfolio_cert" {
  count                     = var.domain_name == "" ? 0 : 1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "portfolio_cert" {
  count           = var.domain_name == "" ? 0 : 1
  certificate_arn = aws_acm_certificate.portfolio_cert[0].arn
  # Waits until the CNAMEs you added at Namecheap have propagated.
  validation_record_fqdns = [for o in aws_acm_certificate.portfolio_cert[0].domain_validation_options : o.resource_record_name]
}
