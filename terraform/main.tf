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
  
  # Make sure to replace "your-terraform-state-bucket" with your actual bucket name
  backend "s3" {
    bucket = "farida-portfolio-terraform-state"
    key    = "farida-portfolio/terraform.tfstate"
    region = "us-east-1"
  }
}