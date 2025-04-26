# dynamodb.tf

# DynamoDB table to store portfolio editable content
resource "aws_dynamodb_table" "portfolio_content" {
  name         = "PortfolioContent"
  billing_mode = "PAY_PER_REQUEST" # Free Tier friendly
  hash_key     = "fieldName"

  attribute {
    name = "fieldName"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = false
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "PortfolioContent"
  }
}

# Pre-populate some default fields (optional)
resource "aws_dynamodb_table_item" "default_content" {
  table_name = aws_dynamodb_table.portfolio_content.name
  hash_key   = aws_dynamodb_table.portfolio_content.hash_key

  for_each = {
    name     = "Mohammad Abdul Faridajalal"
    title    = "Azure DevOps Engineer & Site Reliability Engineer (SRE)"
    location = "Newark, Delaware"
    email    = "mdfaridajalal@gmail.com"
    phone    = "+1 551 245 2594"
    linkedin = "linkedin.com/in/faridajalalmd"
    "about-1" = "Experienced Azure DevOps & SRE engineer with 6 years in cloud solutions, CI/CD, and infrastructure automation."
    "about-2" = "Proven expertise in Azure, AWS, GCP, Terraform, Docker, and Kubernetes."
    "about-3" = "Passionate about reliability engineering, reducing toil, and empowering developer velocity."
  }

  item = jsonencode({
    fieldName = { S = each.key }
    content   = { S = each.value }
    updatedAt = { S = timestamp() }
  })
}
