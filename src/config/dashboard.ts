export const dashboardConfig = {
  api: {
    coingecko: {
      baseUrl: "https://api.coingecko.com/api/v3",
      endpoints: {
        simplePrice: "/simple/price",
      },
    },
  },
  refresh: {
    priceDataInterval: 30000, // 30 seconds
  },
} as const;

export const getCoinGeckoPriceUrl = (assetIds: string) => {
  const { baseUrl, endpoints } = dashboardConfig.api.coingecko;
  return `${baseUrl}${endpoints.simplePrice}?ids=${assetIds}&vs_currencies=usd&include_24hr_change=true`;
}; 
