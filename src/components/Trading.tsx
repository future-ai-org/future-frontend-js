import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loading } from "./Loading";
import "../styles/trading.css";

interface TradingProps {
  assetId: string;
}

export const Trading: React.FC<TradingProps> = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Sample data - replace with real data
  const data = [
    { date: "2024-01-01", price: 100, volume: 1000 },
    { date: "2024-01-02", price: 105, volume: 1200 },
    { date: "2024-01-03", price: 110, volume: 1500 },
    { date: "2024-01-04", price: 115, volume: 1300 },
    { date: "2024-01-05", price: 120, volume: 1400 },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
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
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.bullish + "1a"} />
            <XAxis dataKey="date" stroke={colors.bullish} />
            <YAxis yAxisId="left" stroke={colors.bullish} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.bullish} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.bullish}`,
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="price"
              fill={colors.bullish + "33"}
              stroke={colors.bullish}
            />
            <Bar
              yAxisId="right"
              dataKey="volume"
              fill={colors.bullish + "66"}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
