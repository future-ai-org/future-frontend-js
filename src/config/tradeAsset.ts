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
