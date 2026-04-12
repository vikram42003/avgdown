from models import PriceSnapshot
from decimal import Decimal
from psycopg.rows import class_row
import psycopg
import os
from dotenv import load_dotenv

from models import WatchlistEntryProjection

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

def get_price_snapshots_bulk(asset_id_to_highest_sma: dict[str, int]) -> dict[str, list[Decimal]]:
    conn = get_db()
    with conn.cursor(row_factory=class_row(PriceSnapshot)) as cur:
        cur.execute
