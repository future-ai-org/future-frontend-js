import { CRYPTO_CONFIG } from "./crypto";
import { API_CONFIG } from "./api";

export const CRYPTO_SYMBOL_MAP: { [key: string]: string } = {
  bitcoin: "BTC",
  ethereum: "ETH",
  binancecoin: "BNB",
  solana: "SOL",
  cardano: "ADA",
  tron: "TRX",
  sui: "SUI",
  monero: "XMR",
  dogecoin: "DOGE",
  pepe: "PEPE",
  bonk: "BONK",
  xrp: "XRP",
  trump: "TRUMP",
  uniswap: "UNI",
  cosmos: "ATOM",
  worldcoin: "WLD",
  hyperliquid: "HL",
  story: "STORY",
  litecoin: "LTC",
  tether: "USDT",
  polkadot: "DOT",
  chainlink: "LINK",
  shiba: "SHIB",
} as const;

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
      ids: CRYPTO_CONFIG.CRYPTO_IDS.join(","),
      vs_currencies: "usd",
      include_24hr_change: true,
    },
    CRYPTO_IDS: CRYPTO_CONFIG.CRYPTO_IDS,
    HEADERS: {
      Accept: "application/json",
    },
  },
  WEBSOCKET: {
    BASE_URL: "wss://stream.binance.com:9443/ws",
    STREAM_PREFIX: "@ticker",
    RECONNECT_DELAY: 5000, // 5 seconds
    MAX_STREAMS: 5, // Maximum number of simultaneous WebSocket streams
  },
  DUPLICATION_FACTOR: 3,
  CACHE: {
    KEY: "crypto_prices_cache",
    DURATION: 5 * 60 * 1000, // 5 minutes
  },
} as const;
