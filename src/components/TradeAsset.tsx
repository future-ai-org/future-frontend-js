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
import "@/styles/tradeAsset.css";
import {
  TimePeriod,
  TIME_PERIOD_CONFIG,
  TIME_PERIODS,
} from "@/config/tradeAsset";
import tradingMessages from "@/i18n/tradeAsset.json";
import { COINGECKO_CONFIG } from "@/config/crypto";

interface TradeAssetProps {
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

const processMonthlyData = (data: CandleData[]): CandleData[] => {
  const monthlyData = data.reduce(
    (acc: { [key: string]: CandleData[] }, curr) => {
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

  return Object.values(monthlyData).map((monthData) => {
    const firstDay = monthData[0];
    const lastDay = monthData[monthData.length - 1];
    return {
      date: firstDay.date,
      open: firstDay.open,
      close: lastDay.close,
      high: Math.max(...monthData.map((d) => d.high)),
      low: Math.min(...monthData.map((d) => d.low)),
      volume: monthData.reduce((sum, d) => sum + d.volume, 0),
    };
  });
};

const sampleData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
  open: 100 + Math.random() * 10,
  high: 110 + Math.random() * 10,
  low: 90 + Math.random() * 10,
  close: 105 + Math.random() * 10,
  volume: 1000,
}));

export const TradeAsset: React.FC<TradeAssetProps> = ({ assetId }) => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1D");
  const [colors, setColors] = useState({
    background: "var(--background-color)",
    bullish: "var(--bullish-color)",
    bearish: "var(--bearish-color)",
  });

  const fetchHistoricalData = useCallback(
    async (period: TimePeriod) => {
      try {
        const { days, dataPoints, interval } = TIME_PERIOD_CONFIG[period];

        const chartUrl = `${COINGECKO_CONFIG.BASE_URL}${COINGECKO_CONFIG.MARKET_CHART(assetId, days, interval)}`;

        const response = await fetch(chartUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            tradingMessages.en.error.apiError
              .replace("{{status}}", response.status.toString())
              .replace("{{statusText}}", response.statusText)
              .replace("{{errorText}}", errorText),
          );
        }

        const data = await response.json();

        if (!data.prices || !Array.isArray(data.prices)) {
          throw new Error(tradingMessages.en.error.invalidData);
        }

        const processedData = data.prices.map(
          (price: [number, number], index: number) => {
            const [timestamp, close] = price;
            const open = index > 0 ? data.prices[index - 1][1] : close;
            return {
              date: new Date(timestamp).toISOString(),
              open,
              high: Math.max(open, close),
              low: Math.min(open, close),
              close,
              volume: 0,
            };
          },
        );

        if (period === "1Y") {
          setChartData(processMonthlyData(processedData));
        } else {
          const step = Math.max(
            1,
            Math.floor(processedData.length / dataPoints),
          );
          setChartData(
            processedData.filter(
              (_: CandleData, index: number) => index % step === 0,
            ),
          );
        }
      } catch (err) {
        setChartData(sampleData);
      }
    },
    [assetId],
  );

  useEffect(() => {
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
      const formatOptions: Record<TimePeriod, Intl.DateTimeFormatOptions> = {
        "1D": { hour: "numeric" as const, minute: "2-digit" as const },
        "1W": { weekday: "short" as const, day: "numeric" as const },
        "1M": { month: "short" as const, day: "numeric" as const },
        "3M": { month: "short" as const, day: "numeric" as const },
        "1Y": { month: "short" as const },
        ALL: { month: "short" as const, year: "2-digit" as const },
      };

      const options = formatOptions[timePeriod] || {
        month: "short" as const,
        day: "numeric" as const,
      };

      return timePeriod === "1Y"
        ? date.toLocaleDateString("en-US", options).slice(0, 3)
        : date.toLocaleDateString("en-US", options);
    },
    [timePeriod],
  );

  return (
    <div className="trading-container">
      <div className="time-period-selector">
        {TIME_PERIODS.map((period) => (
          <button
            key={period}
            className={timePeriod === period ? "active" : ""}
            onClick={() => setTimePeriod(period)}
          >
            {period}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{
              fill: colors.background === "#ffffff" ? "#000000" : "#ffffff",
            }}
          />
          <YAxis
            domain={chartConfig.yDomain}
            tick={{
              fill: colors.background === "#ffffff" ? "#000000" : "#ffffff",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.background === "#ffffff" ? "#000000" : "#ffffff"}`,
            }}
            labelStyle={{
              color: colors.background === "#ffffff" ? "#000000" : "#ffffff",
            }}
          />
          <Legend />
          <ReferenceLine
            y={0}
            stroke={colors.background === "#ffffff" ? "#000000" : "#ffffff"}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke={colors.bullish}
            dot={false}
          />
          {chartData.map((entry, index) => (
            <CustomCandlestick
              key={index}
              x={index * chartConfig.candleWidth}
              y={(value) => value}
              width={chartConfig.candleWidth}
              open={entry.open}
              close={entry.close}
              high={entry.high}
              low={entry.low}
              fill={colors.bullish}
              stroke={colors.bearish}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
