from models import WatchlistEntryProjection, TriggeredAlert
from decimal import Decimal
from datetime import date
from psycopg.rows import class_row
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

_conn = None


def get_db() -> psycopg.Connection:
    global _conn

    if _conn is None or _conn.closed:
        DATABASE_URL = os.environ["DATABASE_URL"]
        _conn = psycopg.connect(DATABASE_URL)

    return _conn


def get_watchlist_entries() -> list[WatchlistEntryProjection]:
    """Fetches all the active watchlist entries with a join on assets and users from the database"""

    conn = get_db()
    with conn.cursor(row_factory=class_row(WatchlistEntryProjection)) as cur:
        cur.execute("""
            SELECT
                w.id,
                w.sma_period,
                u.id as user_id,
                u.email as user_email,
                u.webhook_url as user_webhook_url,
                a.id as asset_id,
                a.symbol as asset_symbol,
                a.exchange as asset_exchange
            FROM watchlist_entries as w
            JOIN users as u ON w.user_id = u.id
            JOIN assets as a ON w.asset_id = a.id
            WHERE w.is_active = true
        """)
        return cur.fetchall()


def add_missed_fetch_bulk(missed_fetches: list[tuple[str, str, str]]) -> None:
    if not missed_fetches:
        return

    conn = get_db()

    with conn.cursor() as cur:
        with cur.copy(
            "COPY missed_fetches (asset_id, provider, error_msg) FROM STDIN"
        ) as copy:
            for asset_id, provider, error_msg in missed_fetches:
                copy.write_row((asset_id, provider, error_msg))

    conn.commit()


def get_recent_daily_closes_bulk(
    closes_required_by_asset_id: dict[str, int],
) -> dict[str, list[Decimal]]:
    """
    Fetches the N most recent completed daily closes per asset in one DB query.

    Returns a dict mapping asset_id -> list of closes, newest first.
    The live 15-minute/current price is appended in memory by the alert worker
    as today's provisional daily close.
    """
    filtered_requirements = {
        asset_id: count
        for asset_id, count in closes_required_by_asset_id.items()
        if count > 0
    }
    if not filtered_requirements:
        return {}

    conn = get_db()
    with conn.cursor() as cur:
        values_placeholder = ",".join(["(%s, %s)"] * len(filtered_requirements))

        flat_params = []
        for asset_id, count in filtered_requirements.items():
            flat_params.extend([asset_id, count])

        query = f"""
            WITH requirements AS (
                SELECT column1::text AS req_asset_id, column2::int AS max_limit 
                FROM (VALUES {values_placeholder}) AS v
            )
            SELECT p.asset_id, p.close
            FROM requirements req
            CROSS JOIN LATERAL (
                SELECT asset_id, close, date
                FROM daily_price_snapshots
                WHERE asset_id = req.req_asset_id
                AND date < CURRENT_DATE
                ORDER BY date DESC
                LIMIT req.max_limit
            ) p
        """

        cur.execute(query, flat_params)
        rows = cur.fetchall()

        grouped_closes: dict[str, list[Decimal]] = {}
        for asset_id, close in rows:
            asset_id = str(asset_id)
            if asset_id not in grouped_closes:
                grouped_closes[asset_id] = []
            grouped_closes[asset_id].append(Decimal(str(close)))

        return grouped_closes


def get_alerted_today_entries(entry_ids: list[str]) -> set[str]:
    """Returns watchlist_entry_ids that already have any alert row today."""
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT DISTINCT watchlist_entry_id 
            FROM alerts 
            WHERE watchlist_entry_id = ANY(%s)
            AND created_at >= date_trunc('day', NOW())
            """,
            (entry_ids,),
        )

        return {row[0] for row in cur.fetchall()}


def add_alerts_bulk(alerts_to_add: list[TriggeredAlert]) -> None:
    if not alerts_to_add:
        return

    conn = get_db()

    with conn.cursor() as cur:
        with cur.copy(
            "COPY alerts (watchlist_entry_id, triggered_price, sma_value, delivered) FROM STDIN"
        ) as copy:
            for alert in alerts_to_add:
                copy.write_row(
                    (
                        alert.watchlist_entry_id,
                        alert.triggered_price,
                        alert.sma_value,
                        alert.delivered,
                    )
                )

    conn.commit()


def mark_alerts_as_delivered(watchlist_entry_ids: list[str]) -> None:
    """Updates alerts to delivered=true for the given entry IDs in the last 24 hours"""
    if not watchlist_entry_ids:
        return
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE alerts 
            SET delivered = true, delivered_at = NOW()
            WHERE watchlist_entry_id = ANY(%s)
            AND delivered = false
            AND created_at > NOW() - INTERVAL '24 hours'
            """,
            (watchlist_entry_ids,),
        )
    conn.commit()


def upsert_daily_price_snapshots_bulk(
    rows: list[tuple[str, date, Decimal, str]],
) -> None:
    """
    Upserts completed daily close values into daily_price_snapshots.
    Rows are (asset_id, date, close, source).
    ON CONFLICT updates close/source so provider corrections are safe to rerun.
    """
    if not rows:
        return

    conn = get_db()
    with conn.cursor() as cur:
        print(f"Upserting {len(rows)} daily_price_snapshots rows...")
        cur.executemany(
            """
            INSERT INTO daily_price_snapshots (asset_id, date, close, source)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (asset_id, date) DO UPDATE
                SET close = EXCLUDED.close,
                    source = EXCLUDED.source,
                    updated_at = NOW()
            """,
            rows,
        )
    conn.commit()


def get_daily_price_snapshot_coverage(
    asset_ids: list[str],
) -> dict[str, tuple[int, date | None]]:
    """
    Returns asset_id -> (row_count, latest_date) for daily close hydration checks.
    """
    if not asset_ids:
        return {}

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT asset_id, COUNT(*)::int AS row_count, MAX(date) AS latest_date
            FROM daily_price_snapshots
            WHERE asset_id = ANY(%s)
            GROUP BY asset_id
            """,
            (asset_ids,),
        )
        return {str(row[0]): (row[1], row[2]) for row in cur.fetchall()}
