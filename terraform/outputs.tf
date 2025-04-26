# outputs.tf

output "website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.portfolio.id
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.portfolio_client.id
}

output "cognito_identity_pool_id" {
  description = "Cognito Identity Pool ID"
  value       = aws_cognito_identity_pool.portfolio.id
}

output "aws_region" {
  description = "AWS Region"
  value       = var.aws_region
}

output "deployment_instructions" {
  description = "Next steps for deployment"
  value       = <<-EOT
    Deployment Complete!

    Next steps:
    1. Update src/js/config/aws-config.js with these values:
       - region: ${var.aws_region}
       - userPoolId: ${aws_cognito_user_pool.portfolio.id}
       - clientId: ${aws_cognito_user_pool_client.portfolio_client.id}
       - identityPoolId: ${aws_cognito_identity_pool.portfolio.id}
       - bucketName: ${aws_s3_bucket.assets.bucket}

    2. Build and deploy your website files:
       $ aws s3 sync ./public/ s3://${aws_s3_bucket.website.bucket}/ --delete

    3. Access your website at:
       https://${aws_cloudfront_distribution.website.domain_name}
  EOT
}
