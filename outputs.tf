output "site_url" {
  description = "CloudFront URL (use the custom domain once DNS is pointed at this)"
  value       = "https://${aws_cloudfront_distribution.portfolio_cdn.domain_name}"
}

output "cloudfront_domain_name" {
  description = "Point the Namecheap CNAME (www + apex) at this CloudFront hostname"
  value       = aws_cloudfront_distribution.portfolio_cdn.domain_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.portfolio_cdn.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.portfolio_bucket.bucket
}

output "visitor_counter_url" {
  description = "Lambda Function URL invoked by the visitor counter script"
  value       = aws_lambda_function_url.counter_url.function_url
}

# CNAME records to add at Namecheap to validate the ACM certificate.
# Empty until var.domain_name is set.
output "acm_validation_records" {
  description = "Add these CNAME records in Namecheap Advanced DNS to validate the ACM cert"
  value = var.domain_name == "" ? [] : [
    for o in aws_acm_certificate.portfolio_cert[0].domain_validation_options : {
      host  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  ]
}
