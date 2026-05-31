resource "aws_scheduler_schedule_group" "avgdown_schedule_group" {
  name = "avgdown"
}

resource "aws_scheduler_schedule" "daily_close_scheduler_schedule" {
  name = "avgdown-daily-close-scheduler"
  group_name = aws_scheduler_schedule_group.avgdown_schedule_group.name

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "cron(30 21 ? * MON-FRI *)"

  target {
    arn = aws_lambda_function.daily_close_worker.arn
    role_arn = aws_iam_role.scheduler_lambda_role.arn
  }
}

resource "aws_scheduler_schedule" "live_alert_scheduler_schedule" {
  name = "avgdown-live-alert-scheduler"
  group_name = aws_scheduler_schedule_group.avgdown_schedule_group.name

  flexible_time_window {
    mode = "OFF"
  }

  # Temporarily changing it to every 2 hours from every 30 min
  # schedule_expression = "cron(0/30 * ? * * *)"
  schedule_expression = "cron(0 */2 ? * * *)"

  target {
    arn = aws_lambda_function.live_alert_worker.arn
    role_arn = aws_iam_role.scheduler_lambda_role.arn
  }
}