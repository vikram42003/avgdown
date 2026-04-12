from models import PriceSnapshot, WatchlistEntryProjection
from decimal import Decimal
from psycopg.rows import class_row
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

_conn = None


def get_db() -> psycopg.Connection:
    global _conn

    if _conn == None or _conn.closed:
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
    conn = get_db()
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO price_snapshots (asset_id, price) VALUES (%s, %s)",
            assets_to_update,
        )
    conn.commit()


def add_missed_fetch_bulk(missed_fetches: list[tuple[str, str, str]]) -> None:
    if not missed_fetches:
        return

    conn = get_db()
    with conn.cursor() as cur:
        cur.executemany(
            """
            INSERT INTO missed_fetches (asset_id, provider, error_msg) 
            VALUES (%s, %s, %s)
            """,
            missed_fetches,
        )
    conn.commit()


def get_price_snapshots_bulk(
    asset_id_to_highest_sma: dict[str, int],
) -> dict[str, list[Decimal]]:
    """
    Fetches the N most recent price snapshots per asset in a single DB query,
    where N is the SMA window size (sma_period) for each asset.

    Returns a dict mapping asset_id -> list of prices (newest first),
    ready to calculate the SMA by averaging the list.
    """
    if not asset_id_to_highest_sma:
        return {}

    conn = get_db()
    with conn.cursor(row_factory=class_row(PriceSnapshot)) as cur:
        # Build the string for the VALUES list
        values_placeholder = ",".join(["(%s, %s)"] * len(asset_id_to_highest_sma))

        # Flatten the dict into a list of tuples
        flat_params = []
        for asset_id, sma_period in asset_id_to_highest_sma.items():
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
