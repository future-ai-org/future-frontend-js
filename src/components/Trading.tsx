import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Line,
} from "recharts";
import "../styles/trading.css";
import { TimePeriod, TIME_PERIOD_CONFIG, TIME_PERIODS } from "../config/trading";
import { API_CONFIG } from "../config/api";
import tradingMessages from "../i18n/trading.json";

interface TradingProps {
  assetId: string;
}

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickProps {
  x: number;
  y: (value: number) => number;
  width: number;
  open: number;
  close: number;
  high: number;
  low: number;
  fill: string;
  stroke: string;
}

const CustomCandlestick = React.memo((props: CandlestickProps) => {
  const { x, y, width, open, close, high, low, fill, stroke } = props;
  const isGrowing = close >= open;
  const bodyHeight = Math.abs(y(close) - y(open));
  const bodyY = isGrowing ? y(close) : y(open);

  return (
    <g>
      {/* High-Low line */}
      <line
        x1={x + width / 2}
        y1={y(high)}
        x2={x + width / 2}
        y2={y(low)}
        stroke={isGrowing ? fill : stroke}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x}
        y={bodyY}
        width={width}
        height={bodyHeight}
        fill={isGrowing ? fill : stroke}
        stroke={isGrowing ? fill : stroke}
      />
    </g>
  );
});

CustomCandlestick.displayName = "CustomCandlestick";

export const Trading: React.FC<TradingProps> = ({ assetId }) => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1M");
  const [colors, setColors] = useState({
    background: "var(--background-color)",
    bullish: "var(--bullish-color)",
    bearish: "var(--bearish-color)",
  });

  console.log(tradingMessages.errors.tradingComponentMounted, { assetId });

  const fetchHistoricalData = useCallback(
    async (period: TimePeriod) => {
      try {
        const { days, dataPoints, interval } = TIME_PERIOD_CONFIG[period];
        console.log(tradingMessages.errors.fetchingData, {
          days,
          dataPoints,
          period,
          assetId,
        });

        // Simple CoinGecko API call
        const response = await fetch(
          `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.MARKET_CHART(assetId, days, interval)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        );

        console.log(tradingMessages.errors.apiResponseStatus, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            tradingMessages.errors.apiError
              .replace("{{status}}", response.status.toString())
              .replace("{{statusText}}", response.statusText)
              .replace("{{errorText}}", errorText)
          );
        }

        const data = await response.json();
        console.log(tradingMessages.errors.apiResponseData, data);

        if (!data.prices || !Array.isArray(data.prices)) {
          throw new Error(tradingMessages.errors.invalidDataFormat);
        }

        // Process the data
        const processedData = data.prices.map(
          (price: [number, number], index: number) => {
            const [timestamp, close] = price;
            const open = index > 0 ? data.prices[index - 1][1] : close;
            const high = Math.max(open, close);
            const low = Math.min(open, close);

            return {
              date: new Date(timestamp).toISOString(),
              open,
              high,
              low,
              close,
              volume: 0,
            };
          },
        );

        console.log(tradingMessages.errors.processedDataPoints, processedData.length);

        // For 1Y period, we want to show monthly data points
        if (period === "1Y") {
          // Group data by month
          const monthlyData = processedData.reduce(
            (acc: { [key: string]: CandleData[] }, curr: CandleData) => {
              const date = new Date(curr.date);
              const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
              if (!acc[monthKey]) {
                acc[monthKey] = [];
              }
              acc[monthKey].push(curr);
              return acc;
            },
            {},
          );

          // Create monthly candles
          const monthlyCandles = (
            Object.values(monthlyData) as CandleData[][]
          ).map((monthData: CandleData[]) => {
            const firstDay = monthData[0];
            const lastDay = monthData[monthData.length - 1];
            return {
              date: firstDay.date,
              open: firstDay.open,
              close: lastDay.close,
              high: Math.max(...monthData.map((d: CandleData) => d.high)),
              low: Math.min(...monthData.map((d: CandleData) => d.low)),
              volume: monthData.reduce(
                (sum: number, d: CandleData) => sum + d.volume,
                0,
              ),
            };
          });

          setChartData(monthlyCandles);
        } else {
          // For other periods, use the existing sampling logic
          const step = Math.max(
            1,
            Math.floor(processedData.length / dataPoints),
          );
          const sampledData = processedData.filter(
            (_: CandleData, index: number) => index % step === 0,
          );
          setChartData(sampledData);
        }
      } catch (err) {
        console.error(tradingMessages.errors.fetchError, err);
        // Set some sample data for debugging
        const sampleData = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(
            Date.now() - (30 - i) * 24 * 60 * 60 * 1000,
          ).toISOString(),
          open: 100 + Math.random() * 10,
          high: 110 + Math.random() * 10,
          low: 90 + Math.random() * 10,
          close: 105 + Math.random() * 10,
          volume: 1000,
        }));
        setChartData(sampleData);
      }
    },
    [assetId],
  );

  useEffect(() => {
    console.log(tradingMessages.errors.useEffectTriggered, timePeriod);
    fetchHistoricalData(timePeriod);
  }, [timePeriod, fetchHistoricalData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setColors({
        background:
          getComputedStyle(document.documentElement).getPropertyValue(
            "--color-background",
          ) || "#ffffff",
        bullish:
          getComputedStyle(document.documentElement).getPropertyValue(
            "--color-primary",
          ) || "#22c55e",
        bearish:
          getComputedStyle(document.documentElement).getPropertyValue(
            "--color-secondary",
          ) || "#ef4444",
      });
    }
  }, []);

  const chartConfig = useMemo(() => {
    const min = Math.min(...chartData.map((d) => d.low));
    const max = Math.max(...chartData.map((d) => d.high));
    const range = max - min;
    return {
      yDomain: [Math.floor(min - range * 0.05), Math.ceil(max + range * 0.05)],
      candleWidth: Math.max(5, 500 / chartData.length - 2),
    };
  }, [chartData]);

  const formatDate = useCallback(
    (value: string) => {
      const date = new Date(value);
      switch (timePeriod) {
        case "1D":
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
        case "1W":
          return date.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
          });
        case "1M":
        case "3M":
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        case "1Y":
          return date
            .toLocaleDateString("en-US", { month: "short" })
            .slice(0, 3);
        case "ALL":
          return date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
        default:
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
      }
    },
    [timePeriod],
  );

  return (
    <div className="trading-container">
      <div className="time-period-selector">
        {TIME_PERIODS.map((period) => (
          <button
            key={period}
            className={`time-period-button ${timePeriod === period ? "active" : ""}`}
            onClick={() => setTimePeriod(period)}
          >
            {period}
          </button>
        ))}
      </div>
      <div className="chartiq-container">
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 40,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.bullish + "1a"}
            />
            <XAxis
              dataKey="date"
              stroke={colors.bullish}
              tick={{ fill: colors.bullish }}
              tickFormatter={formatDate}
            />
            <YAxis
              yAxisId="left"
              stroke={colors.bullish}
              tick={{ fill: colors.bullish }}
              domain={chartConfig.yDomain}
              tickFormatter={(value) =>
                `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.bullish}`,
                color: colors.bullish,
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [
                `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                "Price",
              ]}
            />
            <Legend />
            <ReferenceLine
              yAxisId="left"
              y={0}
              stroke={colors.bullish + "1a"}
            />

            {/* Candlesticks */}
            {chartData.length > 0 &&
              chartData.map((entry, index) => {
                const x = index * (500 / chartData.length);
                return (
                  <CustomCandlestick
                    key={index}
                    x={x}
                    y={(value: number) => {
                      const min = Math.min(...chartData.map((d) => d.low));
                      const max = Math.max(...chartData.map((d) => d.high));
                      const range = max - min;
                      return 450 - ((value - min) / range) * 400;
                    }}
                    width={chartConfig.candleWidth}
                    open={entry.open}
                    close={entry.close}
                    high={entry.high}
                    low={entry.low}
                    fill={colors.bullish}
                    stroke={colors.bearish}
                  />
                );
              })}

            {/* Add a line chart for the closing prices */}
            <Line
              type="monotone"
              dataKey="close"
              stroke={colors.bullish + "80"}
              strokeWidth={1}
              dot={false}
              yAxisId="left"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
