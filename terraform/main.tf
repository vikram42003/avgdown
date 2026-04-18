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
  region = "ap-south-1"
  profile = "terraform-cli-user"

  assume_role {
    role_arn = "arn:aws:iam::703671923984:role/TerraformDeployRole"
  }
}