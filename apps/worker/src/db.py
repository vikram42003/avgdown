from models import PriceSnapshot, WatchlistEntryProjection, TriggeredAlert
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
        cur.execute(
            """
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
        """
        )
        return cur.fetchall()


def add_price_snapshots_bulk(assets_to_update: list[tuple[str, Decimal]]) -> None:
    if not assets_to_update:
        return

    conn = get_db()

    with conn.cursor() as cur:
        with cur.copy("COPY price_snapshots (asset_id, price) FROM STDIN") as copy:
            for asset_id, price in assets_to_update:
                copy.write_row((asset_id, price))

    conn.commit()


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


def get_price_snapshots_bulk(
    highest_sma_by_asset_id: dict[str, int],
) -> dict[str, list[Decimal]]:
    """
    Fetches the N most recent price snapshots per asset in a single DB query,
    where N is the SMA window size (sma_period) for each asset.

    Returns a dict mapping asset_id -> list of prices (newest first),
    ready to calculate the SMA by averaging the list.
    """
    if not highest_sma_by_asset_id:
        return {}

    conn = get_db()
    with conn.cursor(row_factory=class_row(PriceSnapshot)) as cur:
        # Build the string for the VALUES list
        values_placeholder = ",".join(["(%s, %s)"] * len(highest_sma_by_asset_id))

        # Flatten the dict into a list of tuples
        flat_params = []
        for asset_id, sma_period in highest_sma_by_asset_id.items():
            flat_params.extend([asset_id, sma_period])

        # How this query works:
        #
        # 1. WITH requirements AS (...)
        #    The VALUES clause creates a temporary in-memory table from our Python list,
        #    e.g. ('asset-1-uuid', 20), ('asset-2-uuid', 50).
        #    Normally VALUES is only used inside INSERT statements, but in Postgres
        #    it can also stand alone as a table expression.
        #
        # 2. CROSS JOIN LATERAL (...)
        #    A standard JOIN matches rows. LATERAL acts like a foreach loop:
        #    for every row in `requirements`, Postgres executes the inner SELECT
        #    with that row's values in scope (req.req_asset_id, req.max_limit).
        #    This is what makes the per-asset dynamic LIMIT possible.
        #    The inner subquery hits the (asset_id, fetched_at DESC) index directly.
        #
        # Result: we get all assets' snapshots back in one round-trip to the DB.
        query = f"""
            WITH requirements AS (
                SELECT column1::text AS req_asset_id, column2::int AS max_limit 
                FROM (VALUES {values_placeholder}) AS v
            )
            SELECT p.id, p.asset_id, p.price, p.fetched_at
            FROM requirements req
            CROSS JOIN LATERAL (
                SELECT id, asset_id, price, fetched_at
                FROM price_snapshots
                WHERE asset_id = req.req_asset_id
                ORDER BY fetched_at DESC
                LIMIT req.max_limit
            ) p
        """

        cur.execute(query, flat_params)
        snapshots = cur.fetchall()

        grouped_prices = {}
        for snapshot in snapshots:
            if snapshot.asset_id not in grouped_prices:
                grouped_prices[snapshot.asset_id] = []
            grouped_prices[snapshot.asset_id].append(snapshot.price)

        return grouped_prices


def get_recently_alerted_entries(entry_ids: list[str]) -> set[str]:
    """Returns a set of watchlist_entry_ids that had an alert successfully sent in the last 24 hours"""
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT DISTINCT watchlist_entry_id 
            FROM alerts 
            WHERE watchlist_entry_id = ANY(%s)
            AND delivered_at > NOW() - INTERVAL '24 hours'
            AND delivered = true
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


def upsert_daily_sma_bulk(rows: list[tuple[str, int, date, float]]) -> None:
    """
    Upserts daily SMA values into daily_sma_snapshots.
    Rows are (asset_id, period, date, sma_value).
    ON CONFLICT updates sma_value so the worker is safe to re-run on the same day.
    """
    if not rows:
        return

    conn = get_db()
    with conn.cursor() as cur:
        cur.executemany(
            """
            INSERT INTO daily_sma_snapshots (asset_id, period, date, sma_value)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (asset_id, period, date) DO UPDATE
                SET sma_value = EXCLUDED.sma_value
            """,
            rows,
        )
    conn.commit()


def get_daily_sma(asset_id: str, period: int) -> Decimal | None:
    """
    Returns today's daily SMA value for an asset+period, or None if not yet computed.
    Called by the 15-min worker before deciding whether to fire an alert.
    """
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT sma_value FROM daily_sma_snapshots
            WHERE asset_id = %s AND period = %s AND date = CURRENT_DATE
            """,
            (asset_id, period),
        )
        row = cur.fetchone()
        return Decimal(str(row[0])) if row else None
