# Package the Lambda function code
data "archive_file" "avgdown_lambda_source_code" {
  type        = "zip"
  source_dir = "${path.module}/../apps/worker/src"
  output_path = "${path.module}/dist/function.zip"
}

# Lambda function
resource "aws_lambda_function" "avgdown_lambda_function" {
  filename      = data.archive_file.avgdown_lambda_source_code.output_path
  function_name = "avgdown_lambda_function"
  role          = aws_iam_role.avgdown_lambda_iam_role.arn
  handler       = "main.lambda_handler"
  code_sha256   = data.archive_file.avgdown_lambda_source_code.output_base64sha256

  runtime = "python3.14"

  environment {
    variables = {
      ENVIRONMENT = "production"
      LOG_LEVEL   = "info"
    }
  }

  tags = {
    project = "avgdown"
  }
}