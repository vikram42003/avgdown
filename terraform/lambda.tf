# Package the Lambda function code
data "archive_file" "worker_source_code" {
  type        = "zip"
  source_dir  = "${path.module}/../apps/worker/src"
  output_path = "${path.module}/dist/function.zip"
}

resource "aws_cloudwatch_log_group" "live_alert_worker" {
  name              = "/aws/lambda/avgdown-live-alert-worker"
  retention_in_days = 14
  tags = {
    project = "avgdown"
  }
}

resource "aws_cloudwatch_log_group" "daily_close_worker" {
  name              = "/aws/lambda/avgdown-daily-close-worker"
  retention_in_days = 14
  tags = {
    project = "avgdown"
  }
}

# Runs during market hours to fetch live prices, compute provisional SMA, and send alerts.
resource "aws_lambda_function" "live_alert_worker" {
  filename      = data.archive_file.worker_source_code.output_path
  function_name = "avgdown-live-alert-worker"
  role          = aws_iam_role.avgdown_lambda_iam_role.arn
  handler       = "live_alert_worker.lambda_handler"
  code_sha256   = data.archive_file.worker_source_code.output_base64sha256
  timeout       = 60
  memory_size   = 256

  runtime = "python3.12"

  environment {
    variables = {
      ENVIRONMENT  = "production"
      LOG_LEVEL    = "info"
      DOMAIN_NAME  = var.domain_name
      DATABASE_URL = var.database_url
    }
  }

  tags = {
    project = "avgdown"
  }

  layers = [aws_lambda_layer_version.python_dependencies.arn]

  # Ensure logs are allowed and the group exists before the lambda is created
  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.live_alert_worker,
  ]
}

# Runs after market close to hydrate completed daily close snapshots.
resource "aws_lambda_function" "daily_close_worker" {
  filename      = data.archive_file.worker_source_code.output_path
  function_name = "avgdown-daily-close-worker"
  role          = aws_iam_role.avgdown_lambda_iam_role.arn
  handler       = "daily_close_worker.lambda_handler"
  code_sha256   = data.archive_file.worker_source_code.output_base64sha256
  timeout       = 60
  memory_size   = 512

  runtime = "python3.12"

  environment {
    variables = {
      ENVIRONMENT  = "production"
      LOG_LEVEL    = "info"
      DATABASE_URL = var.database_url
    }
  }

  tags = {
    project = "avgdown"
  }

  layers = [aws_lambda_layer_version.python_dependencies.arn]

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.daily_close_worker,
  ]
}
