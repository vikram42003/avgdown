from typing import Optional
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime


@dataclass
class User:
    id: str
    email: str
    webhook_url: Optional[str]


@dataclass
class Asset:
    id: str
    symbol: str
    exchange: str
    name: str
    asset_type: str
    created_at: datetime
    updated_at: datetime


@dataclass
class WatchlistEntry:
    id: str
    user_id: str
    asset_id: str
    sma_period: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class WatchlistEntryProjection:
    id: str
    sma_period: int
    # Joined user data
    user_id: str
    user_email: str
    user_webhook_url: Optional[str]
    # Joined asset data
    asset_id: str
    asset_symbol: str
    asset_exchange: str


@dataclass
class PriceSnapshot:
    id: str
    asset_id: str
    price: Decimal
    fetched_at: datetime


@dataclass
class Alert:
    id: str
    watchlist_entry_id: str
    triggered_price: Decimal
    sma_value: Decimal
    delivered: bool
    delivered_at: Optional[datetime]
    created_at: datetime


@dataclass
class TriggeredAlert:
    message: str
    watchlist_entry_id: str
    triggered_price: Decimal
    delivered: bool
    sma_value: Decimal
    user_email: str
    webhook_url: Optional[str]


@dataclass
class MissedFetch:
    id: str
    asset_id: str
    provider: str
    error_msg: Optional[str]
    resolved: bool
    created_at: datetime
