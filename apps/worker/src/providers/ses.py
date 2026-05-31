import os
import logging
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from models import TriggeredAlert
from providers.email_templates import render_alert_email_html, render_alert_email_text

logger = logging.getLogger(__name__)

# Set strict timeouts so SES doesn't hang longer than the Lambda timeout (10s)
ses_config = Config(connect_timeout=2, read_timeout=5, retries={"max_attempts": 2})

ses = boto3.client("sesv2", config=ses_config)


def send_alerts_via_email(
    alerts_by_user: dict[str, dict[str, TriggeredAlert]],
) -> list[str]:
    """
    Sends alerts to users via email using AWS SES.

    Args:
        alerts_by_user: A dictionary mapping user IDs to their triggered alerts.

    Returns:
        A list of watchlist entry IDs for which the email was successfully sent.
    """
    domain_name = os.environ["DOMAIN_NAME"]
    sender = f"alerts@{domain_name}"

    alerts_successfully_sent = []
    for alert_by_entry_ids in alerts_by_user.values():
        if not alert_by_entry_ids:
            continue

        symbols = set()
        messages = []
        user_email = None
        # loop over values since entry_id is unused here
        for alert in alert_by_entry_ids.values():
            if user_email is None:
                user_email = alert.user_email

            symbols.add(alert.symbol)
            messages.append(alert.message)

        alert_list = list(alert_by_entry_ids.values())
        content = {
            "Simple": {
                "Subject": {
                    "Data": f"AvgDown: Price Alert Triggered! for {', '.join(sorted(symbols))}"
                },
                "Body": {
                    "Html": {"Data": render_alert_email_html(domain_name, alert_list)},
                    "Text": {"Data": render_alert_email_text(alert_list)},
                },
            }
        }

        try:
            ses.send_email(
                FromEmailAddress=sender,
                Destination={
                    "ToAddresses": [user_email],
                },
                Content=content,
            )

            alerts_successfully_sent.extend(alert_by_entry_ids.keys())

            # redact email from logs to protect pii
            logger.info(
                "Successfully sent alert for watchlist_entry_id: %s...",
                next(iter(alert_by_entry_ids.values())).watchlist_entry_id[:8]
            )
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "MessageRejected":
                logger.warning(
                    "Skipped: Recipient not verified in SES Sandbox. Code: %s",
                    error_code
                )
            else:
                logger.exception("Failed to send alert due to SES error.")

    return alerts_successfully_sent
