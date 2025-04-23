import React, { useEffect, useState } from "react";
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
  Rectangle,
} from "recharts";
import { Loading } from "./Loading";
import "../styles/trading.css";

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
  ma5?: number;
  ma10?: number;
  rsi?: number;
}

type TimePeriod = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

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

const CustomCandlestick = (props: CandlestickProps) => {
  const { x, y, width, open, close, high, low, fill, stroke } = props;
  const isGrowing = close >= open;
  const bodyHeight = Math.abs(y(close) - y(open));
  const bodyY = isGrowing ? y(close) : y(open);
  
  return (
    <g>
      {/* High-Low line */}
      <Line
        x1={x + width / 2}
        y1={y(high)}
        x2={x + width / 2}
        y2={y(low)}
        stroke={stroke}
        strokeWidth={1}
      />
      {/* Body */}
      <Rectangle
        x={x}
        y={bodyY}
        width={width}
        height={bodyHeight}
        fill={isGrowing ? fill : stroke}
        stroke={stroke}
        strokeWidth={1}
      />
    </g>
  );
};

export const Trading: React.FC<TradingProps> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1M");

  // Generate sample data for different time periods
  const generateData = (period: TimePeriod): CandleData[] => {
    const now = new Date();
    const data: CandleData[] = [];
    let startDate: Date;
    let interval: number;

    switch (period) {
      case "1D":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        interval = 5 * 60 * 1000; // 5 minutes
        break;
      case "1W":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = 30 * 60 * 1000; // 30 minutes
        break;
      case "1M":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = 2 * 60 * 60 * 1000; // 2 hours
        break;
      case "3M":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        interval = 6 * 60 * 60 * 1000; // 6 hours
        break;
      case "1Y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "ALL":
        startDate = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
        interval = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
    }

    let currentPrice = 100;
    let currentDate = startDate;

    while (currentDate <= now) {
      const volatility = Math.random() * 0.02;
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 1000) + 500;

      data.push({
        date: currentDate.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume,
      });

      currentPrice = close;
      currentDate = new Date(currentDate.getTime() + interval);
    }

    return data;
  };

  useEffect(() => {
    const data = generateData(timePeriod);
    
    // Calculate indicators
    const dataWithIndicators = data.map((item, index) => {
      // Calculate MA5
      if (index >= 4) {
        const ma5Sum = data.slice(index - 4, index + 1).reduce((sum, d) => sum + d.close, 0);
        item.ma5 = ma5Sum / 5;
      }

      // Calculate MA10
      if (index >= 9) {
        const ma10Sum = data.slice(index - 9, index + 1).reduce((sum, d) => sum + d.close, 0);
        item.ma10 = ma10Sum / 10;
      }

      // Calculate RSI
      if (index >= 14) {
        const gains = [];
        const losses = [];
        for (let i = index - 13; i <= index; i++) {
          const change = data[i].close - data[i - 1].close;
          gains.push(change > 0 ? change : 0);
          losses.push(change < 0 ? -change : 0);
        }
        const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
        const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
        const rs = avgGain / avgLoss;
        item.rsi = 100 - (100 / (1 + rs));
      }

      return item;
    });

    setChartData(dataWithIndicators);
    setIsLoading(false);
  }, [timePeriod]);

  if (isLoading) {
    return (
      <div className="trading-container">
        <Loading />
      </div>
    );
  }

  const colors = {
    background: getComputedStyle(document.documentElement).getPropertyValue("--color-background"),
    bullish: getComputedStyle(document.documentElement).getPropertyValue("--bullish-color"),
    bearish: getComputedStyle(document.documentElement).getPropertyValue("--bearish-color"),
  };

  const timePeriods: TimePeriod[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

  return (
    <div className="trading-container">
      <div className="time-period-selector">
        {timePeriods.map((period) => (
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
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.bullish + "1a"} />
            <XAxis dataKey="date" stroke={colors.bullish} />
            <YAxis yAxisId="left" stroke={colors.bullish} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.bullish}`,
              }}
            />
            <Legend />
            <ReferenceLine yAxisId="left" y={0} stroke={colors.bullish + "1a"} />
            
            {/* Price line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke={colors.bullish}
              dot={false}
              name="Price"
            />
            
            {/* Candlestick chart */}
            {chartData.map((entry, index) => (
              <CustomCandlestick
                key={index}
                x={index * 20 - 7.5}
                y={(value: number) => value}
                width={15}
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
    </div>
  );
};
