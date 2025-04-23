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
import { API_CONFIG } from "../config/constants";
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
        stroke={isGrowing ? fill : stroke}
        strokeWidth={1}
      />
      {/* Body */}
      <Rectangle
        x={x}
        y={bodyY}
        width={width}
        height={bodyHeight}
        fill={isGrowing ? fill : stroke}
        stroke={isGrowing ? fill : stroke}
        strokeWidth={1}
      />
    </g>
  );
};

export const Trading: React.FC<TradingProps> = ({ assetId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1M");
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = async (period: TimePeriod) => {
    try {
      setIsLoading(true);
      setError(null);

      let days = 1;
      let interval = "daily"; // Default to daily interval
      let dataPoints = 30; // Default number of data points
      
      switch (period) {
        case "1D":
          days = 1;
          interval = "daily";
          dataPoints = 24;
          break;
        case "1W":
          days = 7;
          interval = "daily";
          dataPoints = 7;
          break;
        case "1M":
          days = 30;
          interval = "daily";
          dataPoints = 30;
          break;
        case "3M":
          days = 90;
          interval = "daily";
          dataPoints = 90;
          break;
        case "1Y":
          days = 365;
          interval = "daily";
          dataPoints = 365;
          break;
        case "ALL":
          days = 365 * 2;
          interval = "daily";
          dataPoints = 730;
          break;
      }

      console.log(`Fetching data for period ${period} with days=${days}, interval=${interval}`);

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(
        `${API_CONFIG.COINGECKO.BASE_URL}/coins/${assetId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
        throw new Error("Invalid data format received from API");
      }

      console.log(`Received ${data.prices.length} price points for ${period}`);

      // Process the data to match our CandleData format
      const processedData: CandleData[] = data.prices.map((price: [number, number], index: number) => {
        if (!Array.isArray(price) || price.length < 2) {
          console.warn(`Invalid price data at index ${index}:`, price);
          return null;
        }

        const timestamp = price[0];
        const close = price[1];
        const open = index > 0 ? data.prices[index - 1][1] : close;
        
        // Calculate high and low based on the interval
        let high = close;
        let low = close;
        
        if (period === "1D") {
          // For 1D, look at the last 4 data points
          const lookback = Math.min(4, index);
          high = data.prices
            .slice(Math.max(0, index - lookback), index + 1)
            .reduce((max: number, p: [number, number]) => Math.max(max, p[1]), close);
          low = data.prices
            .slice(Math.max(0, index - lookback), index + 1)
            .reduce((min: number, p: [number, number]) => Math.min(min, p[1]), close);
        } else if (period === "1W") {
          // For 1W, look at the last 2 data points
          const lookback = Math.min(2, index);
          high = data.prices
            .slice(Math.max(0, index - lookback), index + 1)
            .reduce((max: number, p: [number, number]) => Math.max(max, p[1]), close);
          low = data.prices
            .slice(Math.max(0, index - lookback), index + 1)
            .reduce((min: number, p: [number, number]) => Math.min(min, p[1]), close);
        } else {
          // For other periods, use the daily high/low
          high = data.prices[index][1];
          low = data.prices[index][1];
        }

        const volume = data.total_volumes?.[index]?.[1] || 0;

        return {
          date: new Date(timestamp).toISOString().split('T')[0],
          open,
          high,
          low,
          close,
          volume,
        };
      }).filter((item: CandleData | null): item is CandleData => item !== null);

      if (processedData.length === 0) {
        throw new Error("No valid data points after processing");
      }

      console.log(`Processed ${processedData.length} data points for ${period}`);

      // Limit the number of data points to show
      const limitedData = processedData.slice(-dataPoints);

      // Calculate indicators
      const dataWithIndicators = limitedData.map((item: CandleData, index: number) => {
        // Calculate RSI
        if (index >= 14) {
          const gains = [];
          const losses = [];
          for (let i = index - 13; i <= index; i++) {
            const change = limitedData[i].close - limitedData[i - 1].close;
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

      console.log(`Final data points with indicators: ${dataWithIndicators.length}`);
      setChartData(dataWithIndicators);
    } catch (err) {
      console.error(`Error in fetchHistoricalData for period ${period}:`, err);
      setError(err instanceof Error ? err.message : "Failed to fetch market data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData(timePeriod);
  }, [assetId, timePeriod]);

  if (isLoading) {
    return (
      <div className="trading-container">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="trading-container">
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchHistoricalData(timePeriod);
            }}
            className="retry-button"
          >
            Retry
          </button>
        </div>
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
              left: 40,
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
                x={index * 20}
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
