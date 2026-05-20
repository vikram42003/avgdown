from db import mark_alerts_as_delivered_by_id
import json
from datetime import datetime, timezone
from decimal import Decimal

import urllib.request
import urllib.error
from urllib.parse import urlparse

from models import TriggeredAlert
from providers.ses import send_alerts_via_email


def _serialize_decimal(obj: object) -> str:
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def _fire_webhook(webhook_url: str, payload: dict) -> None:
    """Fire-and-forget HTTP POST to the user's webhook URL. Logs failures but never raises."""
    parsed_url = urlparse(webhook_url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        print(f"Rejected invalid webhook URL: {webhook_url[:40]}...")
        return

    try:
        body = json.dumps(payload, default=_serialize_decimal).encode("utf-8")
        req = urllib.request.Request(
            webhook_url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"Webhook delivered to {webhook_url[:40]}... → HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"Webhook HTTP error {e.code} for {webhook_url[:40]}...")
    except Exception as e:
        print(f"Webhook failed for {webhook_url[:40]}...: {e}")


def handle_alerts(
    alerts_by_user: dict[str, dict[str, TriggeredAlert]],
    entry_to_alert_id: dict[str, str],
) -> None:
    """
    Sends out emails, hits the webhook for the successfully sent out email, and then
    marks alerts as delivered for successfully sent out emails

    Args:
        alerts_by_user: A dictionary mapping user IDs to their triggered alerts.
        entry_to_alert_id: A dictionary mapping watchlist entry IDs to alert IDs in the DB.

    Returns:
        None
    """
    # send out emails
    sent_entry_ids: list[str] = send_alerts_via_email(alerts_by_user)
    print(f"Email sent for {len(sent_entry_ids)} watchlist entries")

    # hit the webhooks (fire-and-forget, for now)
    triggered_at = datetime.now(timezone.utc).isoformat()

    for user_alerts in alerts_by_user.values():
        if not user_alerts:
            continue

        # pull the webhook url from the first alert (they all belong to the same user anyway)
        sample_alert = next(iter(user_alerts.values()))
        webhook_url = sample_alert.webhook_url
        if not webhook_url:
            continue

        payload = {
            "event": "alert.triggered",
            "triggered_at": triggered_at,
            "alerts": [
                {
                    "alert_id": entry_to_alert_id.get(entry_id),
                    "symbol": alert.symbol,
                    "triggered_price": alert.triggered_price,
                    "sma_value": alert.sma_value,
                }
                for entry_id, alert in user_alerts.items()
            ],
        }

        _fire_webhook(webhook_url, payload)

    # map successfully sent entry_ids to alert_ids
    sent_alert_ids: list[str] = [
        entry_to_alert_id[eid] for eid in sent_entry_ids if eid in entry_to_alert_id
    ]

    # mark alerts as delivered (in the db)
    print(f"Alerts successfully dispatched: {len(sent_alert_ids)}")
    mark_alerts_as_delivered_by_id(sent_alert_ids)

    return None
