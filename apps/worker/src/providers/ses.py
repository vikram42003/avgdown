import os
import boto3
from botocore.exceptions import ClientError
from models import TriggeredAlert

ses = boto3.client("sesv2")


def send_alerts_via_email(alerts_by_user: dict[str, dict[str, TriggeredAlert]]):
    """Send alerts to users via email"""
    sender = os.environ["SES_EMAIL_IDENTITY"]

    alerts_successfully_sent = []
    for user_id, alert_by_entry_ids in alerts_by_user.items():
        # We want to send each user a single email for all the events that
        # have triggered during this lambda execution

        # Eliminate duplicate symbol names from email title
        symbols = set()
        messages = []
        user_email = None
        for entry_id, alert in alert_by_entry_ids.items():
            if user_email is None:
                user_email = alert.user_email

            symbols.add(alert.symbol)
            messages.append(alert.message)

        content = {
            "Simple": {
                "Subject": {
                    "Data": f"AvgDown: Price Alert Triggered! for {",".join(symbols)}"
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

            print(f"Successfully sent alert to {user_email}")
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            # SES throws this if the email isn't verified in Sandbox mode
            if error_code == "MessageRejected":
                print(f"Skipped {user_email}: Not verified in SES Sandbox.")
            else:
                print(f"Failed to send to {user_email}: {e}")

    return alerts_successfully_sent