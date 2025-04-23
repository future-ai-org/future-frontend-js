import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Line,
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

export const Trading: React.FC<TradingProps> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<CandleData[]>([]);

  useEffect(() => {
    // Sample data with OHLC and volume
    const data: CandleData[] = [
      { date: "2024-01-01", open: 100, high: 110, low: 95, close: 105, volume: 1000 },
      { date: "2024-01-02", open: 105, high: 115, low: 100, close: 110, volume: 1200 },
      { date: "2024-01-03", open: 110, high: 120, low: 105, close: 115, volume: 1500 },
      { date: "2024-01-04", open: 115, high: 125, low: 110, close: 120, volume: 1300 },
      { date: "2024-01-05", open: 120, high: 130, low: 115, close: 125, volume: 1400 },
      { date: "2024-01-06", open: 125, high: 135, low: 120, close: 130, volume: 1600 },
      { date: "2024-01-07", open: 130, high: 140, low: 125, close: 135, volume: 1700 },
      { date: "2024-01-08", open: 135, high: 145, low: 130, close: 140, volume: 1800 },
      { date: "2024-01-09", open: 140, high: 150, low: 135, close: 145, volume: 1900 },
      { date: "2024-01-10", open: 145, high: 155, low: 140, close: 150, volume: 2000 },
    ];

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
  }, []);

  if (isLoading) {
    return (
      <div className="trading-container">
        <Loading />
      </div>
    );
  }

  const colors = {
    background: getComputedStyle(document.documentElement).getPropertyValue("--color-background"),
    bullish: getComputedStyle(document.documentElement).getPropertyValue("--color-bullish"),
    bearish: getComputedStyle(document.documentElement).getPropertyValue("--color-bearish"),
  };

  return (
    <div className="trading-container">
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
            <YAxis yAxisId="right" orientation="right" stroke={colors.bullish} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.bullish}`,
              }}
            />
            <Legend />
            <ReferenceLine yAxisId="left" y={0} stroke={colors.bullish + "1a"} />
            
            {/* Price chart */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke={colors.bullish}
              dot={false}
              name="Price"
            />
            
            {/* Moving Averages */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ma5"
              stroke={colors.bullish + "99"}
              dot={false}
              name="MA5"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ma10"
              stroke={colors.bearish + "99"}
              dot={false}
              name="MA10"
            />
            
            {/* Volume */}
            <Bar
              yAxisId="right"
              dataKey="volume"
              fill={colors.bullish + "66"}
              name="Volume"
            />
            
            {/* RSI */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rsi"
              stroke={colors.bullish + "cc"}
              dot={false}
              name="RSI"
            />
            
            <Brush
              dataKey="date"
              height={30}
              stroke={colors.bullish}
              fill={colors.background}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
