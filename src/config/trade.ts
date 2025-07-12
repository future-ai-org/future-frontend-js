import { COINGECKO_CONFIG, CRYPTO_CONFIG } from "@/config/crypto";
import { CACHE_CONFIG } from "@/config/cache";

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  ath: number;
  ath_date: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface TrendingCoin {
  item: {
    id: string;
  };
}

export const BLUECHIP_COINS = [
  "bitcoin",
  "ethereum",
  "solana",
  "cardano",
  "binancecoin",
  "ripple",
  "chainlink",
  "tron",
  "monero",
  "pepe",
] as const;

export const TRADE_CONFIG = {
  API: {
    CRYPTO_ENDPOINT: `${COINGECKO_CONFIG.BASE_URL}${COINGECKO_CONFIG.ENDPOINTS.MARKETS}?vs_currency=${CRYPTO_CONFIG.CURRENCY}&order=${CRYPTO_CONFIG.ORDER_BY}&per_page=${CRYPTO_CONFIG.TOP_CRYPTO_COUNT}&page=1&sparkline=true`,
    TRENDING_ENDPOINT: `${COINGECKO_CONFIG.BASE_URL}${COINGECKO_CONFIG.ENDPOINTS.SEARCH}`,
    BLUECHIP_ENDPOINT: `${COINGECKO_CONFIG.BASE_URL}${COINGECKO_CONFIG.ENDPOINTS.MARKETS}?vs_currency=${CRYPTO_CONFIG.CURRENCY}&ids=${BLUECHIP_COINS.join(",")}&sparkline=true`,
  },
  CACHE: {
    KEYS: CACHE_CONFIG.KEYS,
    DURATION: CACHE_CONFIG.DURATION,
  },
  CRYPTO: {
    CURRENCY: CRYPTO_CONFIG.CURRENCY,
    ORDER_BY: CRYPTO_CONFIG.ORDER_BY,
    TOP_CRYPTO_COUNT: CRYPTO_CONFIG.TOP_CRYPTO_COUNT,
  },
  BLUECHIP: {
    COINS: BLUECHIP_COINS,
    CACHE_KEY: "bluechip_coins_data",
  },
} as const;
