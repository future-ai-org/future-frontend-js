const SLIDER_CRYPTO_IDS = [
  "bitcoin",
  "ethereum",
  "solana",
  "cardano",
  "xrp",
  "dogecoin",
  "pepe",
  "tron",
  "monero",
  "sui",
  "hyperliquid",
  "story",
  "worldcoin",
  "trump",
].join(",");

export const PRICE_SLIDER_CONFIG = {
  CACHE: {
    KEY: "simple_crypto_prices_cache",
    DURATION: 5 * 60 * 1000, // 5 minutes
  },
  REFRESH_INTERVAL: 60 * 1000, // 1 minute
  API: {
    URL: "https://api.coingecko.com/api/v3/simple/price",
    PARAMS: {
      ids: SLIDER_CRYPTO_IDS,
      vs_currencies: "usd",
      include_24hr_change: true,
    },
  },
} as const;
