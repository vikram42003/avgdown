# Package the Lambda function code
data "archive_file" "avgdown_lambda_source_code" {
  type        = "zip"
  source_dir  = "${path.module}/../apps/worker/src"
  output_path = "${path.module}/dist/function.zip"
}

resource "aws_cloudwatch_log_group" "avgdown_lambda" {
  name              = "/aws/lambda/avgdown_lambda_function"
  retention_in_days = 14
  tags = {
    project = "avgdown"
  }
}

# Lambda function
resource "aws_lambda_function" "avgdown_lambda_function" {
  filename      = data.archive_file.avgdown_lambda_source_code.output_path
  function_name = "avgdown_lambda_function"
  role          = aws_iam_role.avgdown_lambda_iam_role.arn
  handler       = "main.lambda_handler"
  code_sha256   = data.archive_file.avgdown_lambda_source_code.output_base64sha256
  timeout       = 10

  runtime = "python3.12"

  environment {
    variables = {
      ENVIRONMENT        = "production"
      LOG_LEVEL          = "info"
      SES_EMAIL_IDENTITY = var.SES_EMAIL_IDENTITY
      DATABASE_URL       = var.DATABASE_URL
    }
  }

  tags = {
    project = "avgdown"
  }

  layers = [aws_lambda_layer_version.python_dependencies.arn]

  # Ensure logs are allowed and the group exists before the lambda is created
  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.avgdown_lambda,
  ]
}
