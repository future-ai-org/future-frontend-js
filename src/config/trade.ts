import { CRYPTO_CONFIG } from "./crypto";
import { CACHE_CONFIG } from "./cache";
import { API_CONFIG } from "./api";
import { CRYPTO_ICONS } from "./cryptoIcons";

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

export const TRADE_CONFIG = {
  API: {
    CRYPTO_ENDPOINT: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}?vs_currency=${CRYPTO_CONFIG.CURRENCY}&order=${CRYPTO_CONFIG.ORDER_BY}&per_page=${CRYPTO_CONFIG.TOP_CRYPTO_COUNT}&page=1&sparkline=true`,
    MEMECOIN_ENDPOINT: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}?vs_currency=${CRYPTO_CONFIG.CURRENCY}&ids=${CRYPTO_CONFIG.MEMECOIN_IDS.join(",")}&sparkline=true`,
    TRENDING_ENDPOINT: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.SEARCH}`,
  },
  CACHE: {
    KEYS: CACHE_CONFIG.KEYS,
    DURATION: CACHE_CONFIG.DURATION,
  },
  CRYPTO: {
    CURRENCY: CRYPTO_CONFIG.CURRENCY,
    ORDER_BY: CRYPTO_CONFIG.ORDER_BY,
    TOP_CRYPTO_COUNT: CRYPTO_CONFIG.TOP_CRYPTO_COUNT,
    MEMECOIN_IDS: CRYPTO_CONFIG.MEMECOIN_IDS,
  },
  ICONS: CRYPTO_ICONS,
} as const; 
