import { API_CONFIG } from "./api";

export const CRYPTO_CONFIG = {
  MEMECOIN_IDS: ["shiba-inu", "pepe", "floki-inu", "bonk"],
  TOP_CRYPTO_COUNT: 10,
  CURRENCY: API_CONFIG.COINGECKO.PARAMS.VS_CURRENCY,
  ORDER_BY: API_CONFIG.COINGECKO.PARAMS.ORDER,
  CRYPTO_IDS: [
    "bitcoin",
    "ethereum",
    "binancecoin",
    "solana",
    "cardano",
    "dogecoin",
    "shiba-inu",
    "pepe",
    "floki-inu",
    "bonk",
    "tether",
  ],
} as const;
