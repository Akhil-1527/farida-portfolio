# variables.tf

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "farida-portfolio"
}

variable "admin_emails" {
  description = "List of admin email addresses to pre-populate in Cognito"
  type        = list(string)
  default     = [
    "mdfaridajalal@gmail.com",
    "akhilc1227@gmail.com"
  ]
}

variable "domain_name" {
  description = "Domain name for the portfolio website (leave empty for S3 website endpoint)"
  type        = string
  default     = ""
}
