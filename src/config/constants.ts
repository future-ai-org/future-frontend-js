export const API_CONFIG = {
  COINGECKO: {
    BASE_URL: "https://api.coingecko.com/api/v3",
    ENDPOINTS: {
      MARKETS: "/coins/markets",
      SEARCH: "/search/trending",
      COIN_DETAILS: "/coins/{{id}}",
    },
    PARAMS: {
      VS_CURRENCY: "usd",
      ORDER: "market_cap_desc",
      PER_PAGE: 20,
      PAGE: 1,
      SPARKLINE: false,
    },
  },
} as const;

export const CACHE_CONFIG = {
  KEYS: {
    CRYPTO_DATA: "cachedCryptoData",
    MEMECOIN_DATA: "cachedMemecoinData",
    TRENDING_DATA: "cachedTrendingData",
    TIMESTAMP: "cachedDataTimestamp",
  },
  DURATION: 300000,
} as const;

// Crypto Configuration
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

// Price Slider Configuration
export const PRICE_SLIDER_CONFIG = {
  REFRESH_INTERVAL: 30000,
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
  ANIMATION: {
    DURATION: 30,
  },
  API: {
    URL: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}`,
    PARAMS: API_CONFIG.COINGECKO.PARAMS,
    CRYPTO_IDS: CRYPTO_CONFIG.CRYPTO_IDS,
  },
  DUPLICATION_FACTOR: 4,
} as const;

// Trading Configuration
export const TRADING_CONFIG = {
  WIDGET: {
    width: "100%",
    height: "100%",
    autosize: true,
    symbol: "",
    interval: "D",
    timezone: "exchange",
    theme: "dark",
    style: "1",
    locale: "en",
    enable_publishing: false,
    allow_symbol_change: false,
    hide_side_toolbar: true,
    hideideas: true,
    hide_legend: true,
    hide_volume: true,
    container_id: "",
    overrides: {
      "mainSeriesProperties.candleStyle.upColor": "var(--color-bullish)",
      "mainSeriesProperties.candleStyle.downColor": "var(--color-bearish)",
      "mainSeriesProperties.candleStyle.borderUpColor": "var(--color-bullish)",
      "mainSeriesProperties.candleStyle.borderDownColor": "var(--color-bearish)",
      "mainSeriesProperties.candleStyle.wickUpColor": "var(--color-bullish)",
      "mainSeriesProperties.candleStyle.wickDownColor": "var(--color-bearish)",
      "paneProperties.background": "var(--color-background)",
      "paneProperties.vertGridProperties.color": "var(--color-bullish)1a",
      "paneProperties.horzGridProperties.color": "var(--color-bullish)1a",
      "scalesProperties.textColor": "var(--color-bullish)",
      "scalesProperties.backgroundColor": "var(--color-background)",
      "mainSeriesProperties.background": "var(--color-background)",
      "mainSeriesProperties.gridColor": "var(--color-bullish)1a",
      "mainSeriesProperties.crossHairProperties.color": "var(--color-bullish)",
      "mainSeriesProperties.crossHairProperties.width": 1,
      "mainSeriesProperties.crossHairProperties.style": 2,
      "mainSeriesProperties.crossHairProperties.visible": true,
      "mainSeriesProperties.crossHairProperties.labelBackgroundColor": "var(--color-background)",
    },
    studies_overrides: {
      "volume.volume.color.0": "var(--color-bullish)",
      "volume.volume.color.1": "var(--color-bearish)",
      "volume.volume.transparency": 70,
    },
  },
  SYMBOL_FORMAT: {
    EXCHANGE: "BINANCE",
    SEPARATOR: ":",
    QUOTE: "USDT",
  },
  TRADING_SCRIPT: "https://s3.tradingview.com/tv.js",
  SCRIPT_ID: "trading-widget-script",
  MAX_RETRIES: 5,
} as const;

// Backward compatibility exports
export const API_ENDPOINTS = {
  COINGECKO: {
    MARKETS: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}`,
    SEARCH: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.SEARCH}`,
    COIN_DETAILS: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.COIN_DETAILS}`,
  },
} as const;

export interface TradingData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  ath_date: string;
  atl: number;
  atl_date: string;
}
