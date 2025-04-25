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
    MARKET_CHART: (coinId: string, days: string | number, interval: string) =>
      `/coins/${coinId.toLowerCase()}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
  },
} as const;

// Backward compatibility exports
export const API_ENDPOINTS = {
  COINGECKO: {
    MARKETS: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}`,
    SEARCH: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.SEARCH}`,
    COIN_DETAILS: `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.COIN_DETAILS}`,
  },
} as const;
