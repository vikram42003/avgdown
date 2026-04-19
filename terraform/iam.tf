# IAM role for Lambda execution
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "avgdown_lambda_iam_role" {
  name               = "tf_avgdown_lambda_iam_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.avgdown_lambda_iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ses" {
  name = "lambda-ses-send"
  role = aws_iam_role.avgdown_lambda_iam_role.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ],
        Resource = aws_sesv2_email_identity.ses_email.arn,
        # Enforce that the 'From' address header must match our verified identity to prevent header spoofing.
        Condition = {
          StringEquals = {
            "ses:FromAddress" = var.ses_email_identity
          }
        }
      }
    ]
  })
}