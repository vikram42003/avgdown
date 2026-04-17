# Package the Lambda function code
data "archive_file" "avgdown_lambda_source_code" {
  type        = "zip"
  source_dir  = "${path.module}/../apps/worker/src"
  output_path = "${path.module}/dist/function.zip"
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
      ENVIRONMENT = "production"
      LOG_LEVEL   = "info"
    }
  }

  tags = {
    project = "avgdown"
  }

  layers = [aws_lambda_layer_version.python_dependencies.arn]

  # Ensure logs are allowed before the lambda is created
  depends_on = [aws_iam_role_policy_attachment.lambda_logs]
}
