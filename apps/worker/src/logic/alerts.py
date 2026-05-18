import json
from datetime import datetime, timezone
from decimal import Decimal

import urllib.request
import urllib.error

from models import TriggeredAlert
from providers.ses import send_alerts_via_email


def _serialize_decimal(obj: object) -> str:
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def _fire_webhook(webhook_url: str, payload: dict) -> None:
    """Fire-and-forget HTTP POST to the user's webhook URL. Logs failures but never raises."""
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
) -> list[str]:
    """
    Orchestrates alert dispatch for the current worker run.

    1. Sends all alerts via email (grouped per user in one email).
    2. Fires webhooks (fire-and-forget) for users who have a webhook_url configured.
    3. Returns the list of alert IDs that were successfully emailed, so the
       caller can mark exactly those rows as delivered in the DB.
    """
    # --- Step 1: Email ---
    sent_entry_ids: list[str] = send_alerts_via_email(alerts_by_user)
    print(f"Email sent for {len(sent_entry_ids)} watchlist entries")

    # --- Step 2: Webhooks (fire-and-forget per user) ---
    triggered_at = datetime.now(timezone.utc).isoformat()

    for user_alerts in alerts_by_user.values():
        if not user_alerts:
            continue

        # Grab webhook_url from any alert in this user's batch (all same user)
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

    # --- Step 3: Map successfully sent entry_ids → alert_ids ---
    sent_alert_ids: list[str] = [
        entry_to_alert_id[eid]
        for eid in sent_entry_ids
        if eid in entry_to_alert_id
    ]

    return sent_alert_ids
