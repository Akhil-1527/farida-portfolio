# main.tf

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "FaridaPortfolio"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    key = "farida-portfolio/terraform.tfstate"
  }
}
