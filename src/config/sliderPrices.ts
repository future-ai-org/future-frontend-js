import { COINGECKO_CONFIG, BLUECHIP_COINS } from "./coingecko";

export const SLIDER_CRYPTO_IDS = BLUECHIP_COINS.join(",");

export const PRICE_SLIDER_CONFIG = {
  CACHE: {
    KEY: "simple_crypto_prices_cache",
    DURATION: 5 * 60 * 1000, // 5 minutes
  },
  REFRESH_INTERVAL: 60 * 1000, // 1 minute
  API: {
    URL: COINGECKO_CONFIG.SIMPLE_PRICE_URL(SLIDER_CRYPTO_IDS),
  },
} as const;
