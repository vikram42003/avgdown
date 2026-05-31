import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { AssetResponseDto, AssetSearchResultDto } from "./assets.dto";
import { PrismaService } from "../common/database/prisma/prisma.service";
import type { Exchange, AssetType } from "@avgdown/types";

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

/** Minimal shape of a Yahoo Finance-backed search quote result we care about. */
interface YahooSearchQuote {
  isYahooFinance: true;
  symbol: string;
  exchange: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
}

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Maps Yahoo Finance quote types to our internal AssetType enum.
 * Defaults to "STOCK" for unrecognized types.
 */
function mapYahooTypeToAssetType(quoteType: string | undefined): AssetType {
  switch (quoteType?.toUpperCase()) {
    case "ETF":
      return "ETF";
    case "CRYPTOCURRENCY":
      return "CRYPTO";
    default:
      return "STOCK";
  }
}

/**
 * Maps Yahoo Finance exchange names to our Exchange enum.
 * Returns null for unsupported exchanges.
 */
function mapYahooExchange(exchange: string | undefined): Exchange | null {
  if (!exchange) return null;
  const upper = exchange.toUpperCase();

  if (upper.includes("NAS") || upper === "NMS" || upper === "NGM") return "NASDAQ";
  if (upper === "NYQ" || upper === "NYSE" || upper === "NYS") return "NYSE";
  if (upper === "NSI" || upper === "NSE") return "NSE";
  if (upper === "BSE" || upper === "BOM") return "BSE";
  // Crypto exchanges in Yahoo Finance use CCC (CryptoCurrencyCompare)
  if (upper === "CCC" || upper.includes("BINANCE")) return "BINANCE";
  if (upper.includes("COINBASE")) return "COINBASE";

  return null;
}

/** Simple in-memory TTL cache for search results. Works on serverless warm instances. */
const searchCache = new Map<string, { results: AssetSearchResultDto[]; timestamp: number }>();

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AssetResponseDto[]> {
    return await this.prisma.asset.findMany();
  }

  async findPopular(): Promise<AssetResponseDto[]> {
    return await this.prisma.asset.findMany({ where: { isPopular: true } });
  }

  async findOne(id: string): Promise<AssetResponseDto> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (asset === null) {
      this.logger.warn(`Lookup failed: Asset with id ${id} not found`);
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return asset;
  }

  async search(query: string): Promise<AssetSearchResultDto[]> {
    const cacheKey = query.toLowerCase().trim();

    // Check in-memory cache
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS) {
      this.logger.debug(`Search cache hit for "${cacheKey}"`);
      return cached.results;
    }

    this.logger.log(`Searching Yahoo Finance for "${query}"`);

    const yahooResults = await yahooFinance.search(query, { newsCount: 0 });
    const quotes = yahooResults.quotes ?? [];

    // Filter to Yahoo Finance-backed quotes only (non-Yahoo results have no symbol/exchange).
    // Cast to unknown[] first to avoid the SDK's complex union type conflicting with our
    // narrower local interface — isYahooFinance is the runtime discriminant we rely on.
    const yahooQuotes = (quotes as unknown[]).filter(
      (q): q is YahooSearchQuote =>
        typeof q === "object" && q !== null && (q as YahooSearchQuote).isYahooFinance === true,
    );

    // Cross-reference with our DB to find existing asset IDs
    const symbolExchangePairs = yahooQuotes
      .map((q) => {
        const exchange = mapYahooExchange(q.exchange);
        return exchange ? { symbol: q.symbol, exchange } : null;
      })
      .filter((pair): pair is { symbol: string; exchange: Exchange } => pair !== null);

    const existingAssets =
      symbolExchangePairs.length > 0
        ? await this.prisma.asset.findMany({
            where: {
              OR: symbolExchangePairs.map((p) => ({ symbol: p.symbol, exchange: p.exchange })),
            },
            select: { id: true, symbol: true, exchange: true },
          })
        : [];

    const existingMap = new Map(existingAssets.map((a) => [`${a.symbol}:${a.exchange}`, a.id]));

    const results: AssetSearchResultDto[] = [];
    for (const q of yahooQuotes) {
      const exchange = mapYahooExchange(q.exchange);
      if (!exchange) continue;
      results.push({
        symbol: q.symbol,
        name: q.shortname ?? q.longname ?? q.symbol,
        exchange,
        assetType: mapYahooTypeToAssetType(q.quoteType),
        existingAssetId: existingMap.get(`${q.symbol}:${exchange}`) ?? null,
      });
    }

    // Cache the results
    searchCache.set(cacheKey, { results, timestamp: Date.now() });

    return results;
  }

  /**
   * Finds an existing asset by symbol+exchange or creates a new one.
   * Used when a user adds a search result to their watchlist.
   */
  async findOrCreateAsset(
    symbol: string,
    exchange: Exchange,
    name: string,
    assetType: AssetType,
  ): Promise<AssetResponseDto> {
    const existing = await this.prisma.asset.findUnique({
      where: { symbol_exchange: { symbol, exchange } },
    });

    if (existing) {
      return existing;
    }

    this.logger.log(`Creating new asset: ${symbol} on ${exchange}`);
    return await this.prisma.asset.create({
      data: { symbol, exchange, name, assetType, isPopular: false },
    });
  }

  async remove(id: string): Promise<AssetResponseDto> {
    return await this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id } });
      if (asset === null) {
        this.logger.warn(`Lookup failed: Asset with id ${id} not found`);
        throw new NotFoundException(`Asset with id ${id} not found`);
      }

      this.logger.log(`[Asset Deletion Protocol Initiated] Target: ${asset.symbol} (ID: ${id})`);

      const [alertsCount, weCount, dailyPriceCount, mfCount] = await Promise.all([
        tx.alert.count({ where: { watchlistEntry: { assetId: id } } }),
        tx.watchlistEntry.count({ where: { assetId: id } }),
        tx.dailyPriceSnapshot.count({ where: { assetId: id } }),
        tx.missedFetch.count({ where: { assetId: id } }),
      ]);

      this.logger.warn(`Cascading delete will permanently remove:`);
      this.logger.warn(` - ${alertsCount} Alerts`);
      this.logger.warn(` - ${weCount} Watchlist Entries`);
      this.logger.warn(` - ${dailyPriceCount} Daily Price Snapshots`);
      this.logger.warn(` - ${mfCount} Missed Fetches`);

      const deletedAsset = await tx.asset.delete({ where: { id } });
      this.logger.log(`[Asset Deletion Complete] Asset successfully deleted: ${deletedAsset.symbol} (ID: ${id})`);

      return deletedAsset;
    });
  }
}
