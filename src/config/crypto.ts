export const COINGECKO_CONFIG = {
  BASE_URL: "https://api.coingecko.com/api/v3",
  ENDPOINTS: {
    MARKETS: "/coins/markets",
    SEARCH: "/search/trending",
    COIN_DETAILS: "/coins/{{id}}",
    SIMPLE_PRICE: "/simple/price",
  },
  PARAMS: {
    VS_CURRENCY: "usd",
    ORDER: "market_cap_desc",
  },
  MARKET_CHART: (coinId: string, days: string | number, interval: string) =>
    `/coins/${coinId.toLowerCase()}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
  SIMPLE_PRICE_URL: (assetIds: string) =>
    `${COINGECKO_CONFIG.BASE_URL}${COINGECKO_CONFIG.ENDPOINTS.SIMPLE_PRICE}?ids=${assetIds}&vs_currencies=usd&include_24hr_change=true`,
} as const;

export const CRYPTO_CONFIG = {
  TOP_CRYPTO_COUNT: 10,
  CURRENCY: COINGECKO_CONFIG.PARAMS.VS_CURRENCY,
  ORDER_BY: COINGECKO_CONFIG.PARAMS.ORDER,
} as const;

export const SLIDER_CRYPTO_IDS = [
  "bitcoin",
  "ethereum",
  "solana",
  "cardano",
  "pepe",
  "tron",
  "monero",
  "hyperliquid",
  "story",
  "worldcoin",
  "trump",
  "bittensor",
].join(",");

export const PREDICTION_TARGETS = {
  bitcoin: { title: "bitcoin price", target: "$150,000" },
  ethereum: { title: "ethereum price", target: "$5,000" },
  solana: { title: "solana price", target: "$500" },
  cardano: { title: "cardano price", target: "$10" },
  pepe: { title: "pepe price", target: "$0.01" },
  tron: { title: "tron price", target: "$1" },
  monero: { title: "monero price", target: "$500" },
  hyperliquid: { title: "hyperliquid price", target: "$100" },
  story: { title: "story price", target: "$10" },
  worldcoin: { title: "worldcoin price", target: "$50" },
  trump: { title: "trump price", target: "$50" },
  bittensor: { title: "bittensor price", target: "$400" },
} as const;
