resource "aws_sesv2_configuration_set" "ses_configs" {
  configuration_set_name = "avgdown-ses-configs"
}

resource "aws_sesv2_email_identity" "ses_domain_identity" {
  email_identity         = var.domain_name
  configuration_set_name = aws_sesv2_configuration_set.ses_configs.configuration_set_name
}

output "dkim_tokens" {
  value = aws_sesv2_email_identity.ses_domain_identity.dkim_signing_attributes[0].tokens
}

resource "aws_sesv2_email_identity_mail_from_attributes" "ses_mail_from" {
  email_identity   = aws_sesv2_email_identity.ses_domain_identity.email_identity
  mail_from_domain = "mail.${var.domain_name}"
}

resource "aws_sesv2_configuration_set_event_destination" "ses_cw_logs" {
  configuration_set_name = aws_sesv2_configuration_set.ses_configs.configuration_set_name
  event_destination_name = "cw-logs"

  event_destination {
    cloud_watch_destination {
      dimension_configuration {
        dimension_name          = "configurationSet"
        dimension_value_source  = "MESSAGE_TAG"
        default_dimension_value = "avgdown-ses-configs"
      }
    }

    enabled = true

    matching_event_types = [
      "SEND",
      "DELIVERY",
      "BOUNCE",
      "COMPLAINT",
      "REJECT"
    ]
  }
}
