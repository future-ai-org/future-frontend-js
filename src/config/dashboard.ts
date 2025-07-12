import { COINGECKO_CONFIG } from "./coingecko";

export const dashboardConfig = {
  refresh: {
    priceDataInterval: 30000, // 30 seconds
  },
} as const;

export const getCoinGeckoPriceUrl = (assetIds: string) => {
  return COINGECKO_CONFIG.SIMPLE_PRICE_URL(assetIds);
};
