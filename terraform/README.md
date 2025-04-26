# Farida Portfolio - AWS Terraform Deployment Guide

This Terraform module provisions a full AWS infrastructure to host a dynamic portfolio website for Mohammad Abdul Faridajalal.

---

## 📦 Resources Provisioned

- ✅ **S3 (Website Hosting + Asset Storage)**
- ✅ **CloudFront (CDN & SSL)**
- ✅ **DynamoDB (Portfolio Text Data)**
- ✅ **Cognito (Admin Login Authentication)**
- ✅ **IAM (Secure Access Management)**

---

## 🛠 Prerequisites

- AWS CLI installed and configured (`aws configure`)
- Terraform CLI installed (`terraform -v`)
- Admin AWS IAM credentials with permissions to create S3, DynamoDB, Cognito, CloudFront

---

## 🚀 Deployment Steps

### 1. Initialize Terraform

```bash
cd terraform/
terraform init
