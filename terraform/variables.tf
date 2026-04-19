variable "ses_email_identity" {
  type = string
}

variable "database_url" {
  type     = string
  sensitive = true
}

variable "aws_profile" {
  type = string
  default = "terraform-cli-user"
}

variable "aws_region" {
  type = string
}

variable "terraform_deploy_role_arn" {
  type = string
  sensitive = true
}
