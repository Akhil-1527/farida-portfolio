# cognito.tf

# Cognito User Pool
resource "aws_cognito_user_pool" "portfolio" {
  name = "${var.project_name}-user-pool"
  
  # Account recovery settings
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  
  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
  
  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  
  # Admin creation settings
  admin_create_user_config {
    allow_admin_create_user_only = true
  }
  
  # Schema attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true
  }
  
  # Username attributes
  username_attributes = ["email"]
  auto_verified_attributes = ["email"]
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "portfolio_client" {
  name         = "${var.project_name}-client"
  user_pool_id = aws_cognito_user_pool.portfolio.id
  
  # No client secret for JavaScript applications
  generate_secret = false
  
  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
  
  # Callback and logout URLs (for SPA)
  callback_urls = var.domain_name != "" ? ["https://${var.domain_name}/admin.html"] : ["https://${aws_cloudfront_distribution.website.domain_name}/admin.html"]
  logout_urls   = var.domain_name != "" ? ["https://${var.domain_name}/index.html"] : ["https://${aws_cloudfront_distribution.website.domain_name}/index.html"]
  
  # Token validity
  refresh_token_validity = 30
  access_token_validity  = 1
  id_token_validity      = 1
  
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
  
  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"
  
  supported_identity_providers = ["COGNITO"]
}

# Cognito Identity Pool
resource "aws_cognito_identity_pool" "portfolio" {
  identity_pool_name               = "${var.project_name} Identity Pool"
  allow_unauthenticated_identities = true
  
  # Connect to User Pool
  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.portfolio_client.id
    provider_name           = "cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.portfolio.id}"
    server_side_token_check = false
  }
}

# Create admin users
resource "null_resource" "create_admin_users" {
  for_each = toset(var.admin_emails)
  
  # This will run for each admin email
  provisioner "local-exec" {
    command = <<EOF
      aws cognito-idp admin-create-user \
        --user-pool-id ${aws_cognito_user_pool.portfolio.id} \
        --username ${each.value} \
        --user-attributes Name=email,Value=${each.value} Name=email_verified,Value=true \
        --temporary-password 'Temp123!' \
        --region ${var.aws_region}
    EOF
  }
  
  depends_on = [aws_cognito_user_pool.portfolio]
}