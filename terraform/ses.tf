resource "aws_sesv2_configuration_set" "ses_configs" {
  configuration_set_name = "avgdown-ses-configs"
}

resource "aws_sesv2_email_identity" "ses_email" {
  email_identity         = var.ses_email_identity
  configuration_set_name = aws_sesv2_configuration_set.ses_configs.configuration_set_name
}


resource "aws_sesv2_configuration_set_event_destination" "cw_logs" {
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
