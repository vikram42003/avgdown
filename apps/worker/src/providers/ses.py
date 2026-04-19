import os
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from models import TriggeredAlert

# Set strict timeouts so SES doesn't hang longer than the Lambda timeout (10s)
ses_config = Config(
    connect_timeout=2,
    read_timeout=5,
    retries={'max_attempts': 2}
)

ses = boto3.client("sesv2", config=ses_config)


def send_alerts_via_email(alerts_by_user: dict[str, dict[str, TriggeredAlert]]):
    """Send alerts to users via email"""
    sender = os.environ["SES_EMAIL_IDENTITY"]

    alerts_successfully_sent = []
    for alert_by_entry_ids in alerts_by_user.values():
        if not alert_by_entry_ids:
            continue

        symbols = set()
        messages = []
        user_email = None
        # Loop over values since entry_id is unused here
        for alert in alert_by_entry_ids.values():
            if user_email is None:
                user_email = alert.user_email

            symbols.add(alert.symbol)
            messages.append(alert.message)

        content = {
            "Simple": {
                "Subject": {
                    "Data": f"AvgDown: Price Alert Triggered! for {', '.join(sorted(symbols))}"
                },
                "Body": {"Text": {"Data": "\n".join(messages)}},
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

            # Redact email from logs to protect PII
            print(f"Successfully sent alert to user_id: {next(iter(alert_by_entry_ids.values())).watchlist_entry_id[:8]}...")
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "MessageRejected":
                print(f"Skipped: Recipient not verified in SES Sandbox. Code: {error_code}")
            else:
                print(f"Failed to send alert. SES Error: {error_code}")

    return alerts_successfully_sent
