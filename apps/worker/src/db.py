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
