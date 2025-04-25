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
    container_id: "trading_widget",
    overrides: {
      "mainSeriesProperties.candleStyle.upColor": "var(--color-bullish)",
      "mainSeriesProperties.candleStyle.downColor": "var(--color-bearish)",
      "mainSeriesProperties.candleStyle.borderUpColor": "var(--color-bullish)",
      "mainSeriesProperties.candleStyle.borderDownColor":
        "var(--color-bearish)",
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
      "mainSeriesProperties.crossHairProperties.labelBackgroundColor":
        "var(--color-background)",
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

export type TimePeriod = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export const TIME_PERIOD_CONFIG = {
  "1D": { days: 1, dataPoints: 24, interval: "hourly" },
  "1W": { days: 7, dataPoints: 7, interval: "daily" },
  "1M": { days: 30, dataPoints: 30, interval: "daily" },
  "3M": { days: 90, dataPoints: 90, interval: "daily" },
  "1Y": { days: 365, dataPoints: 365, interval: "daily" },
  ALL: { days: "max", dataPoints: 365 * 2, interval: "daily" },
} as const;

export const TIME_PERIODS: TimePeriod[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];
