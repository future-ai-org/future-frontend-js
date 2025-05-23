import { CRYPTO_CONFIG } from "./crypto";
import { API_CONFIG } from "./api";

export const PRICE_SLIDER_CONFIG = {
  REFRESH_INTERVAL: 120000,
  MAX_RETRIES: 5,
  RETRY_DELAY: {
    BASE: 1000,
    MAX: 30000,
  },
  PRICE_FORMAT: {
    MIN_FRACTION_DIGITS: 2,
    MAX_FRACTION_DIGITS: {
      SMALL: 6,
      LARGE: 2,
    },
  },
  API: {
    URL: `${API_CONFIG.COINGECKO.BASE_URL}/simple/price`,
    PARAMS: {
      ids: CRYPTO_CONFIG.CRYPTO_IDS.join(','),
      vs_currencies: 'usd',
      include_24hr_change: true,
    },
    CRYPTO_IDS: CRYPTO_CONFIG.CRYPTO_IDS,
  },
  WEBSOCKET: {
    BASE_URL: 'wss://stream.binance.com:9443/stream',
    STREAM_PREFIX: 'usdt@ticker',
  },
  DUPLICATION_FACTOR: 10,
  CACHE: {
    KEY: 'crypto_prices_cache',
    DURATION: 5 * 60 * 1000, // 5 minutes
  },
} as const;
