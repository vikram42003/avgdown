terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket = "avgdown-terraform-state"
    key = "state/terraform.tfstate"
    region = "ap-south-1"
    encrypt = true
    dynamodb_table = "avgdown-terraform-lock"
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
  profile = var.aws_profile

  assume_role {
    role_arn = var.terraform_deploy_role_arn
  }
}