import React, { useEffect, useState, useCallback } from "react";
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
      <Line
        x1={x}
        y1={bodyY}
        x2={x + width}
        y2={bodyY}
        stroke={isGrowing ? fill : stroke}
        strokeWidth={width}
      />
    </g>
  );
};

const getTimePeriodConfig = (period: TimePeriod) => {
  switch (period) {
    case "1D":
      return { days: 1, dataPoints: 24 };
    case "1W":
      return { days: 7, dataPoints: 7 };
    case "1M":
      return { days: 30, dataPoints: 30 };
    case "3M":
      return { days: 90, dataPoints: 90 };
    case "1Y":
      return { days: 365, dataPoints: 365 };
    case "ALL":
      return { days: 365 * 2, dataPoints: 730 };
    default:
      return { days: 30, dataPoints: 30 };
  }
};

export const Trading: React.FC<TradingProps> = ({ assetId }) => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1M");
  const [colors, setColors] = useState({
    background: '#ffffff',
    bullish: '#22c55e',
    bearish: '#ef4444',
  });

  console.log('Trading component mounted with assetId:', assetId);

  const fetchHistoricalData = useCallback(async (period: TimePeriod) => {
    try {
      const { days, dataPoints } = getTimePeriodConfig(period);
      console.log('Fetching data with config:', { days, dataPoints, period, assetId });

      // Simple CoinGecko API call
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${assetId.toLowerCase()}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);

      if (!data.prices || !Array.isArray(data.prices)) {
        throw new Error("Invalid data format received from API");
      }

      // Process the data
      const processedData = data.prices.map((price: [number, number], index: number) => {
        const [timestamp, close] = price;
        const open = index > 0 ? data.prices[index - 1][1] : close;
        const high = Math.max(open, close);
        const low = Math.min(open, close);

        return {
          date: new Date(timestamp).toISOString().split('T')[0],
          open,
          high,
          low,
          close,
          volume: 0
        };
      });

      console.log('Processed data points:', processedData.length);
      setChartData(processedData.slice(-dataPoints));
    } catch (err) {
      console.error('Error in fetchHistoricalData:', err);
      // Set some sample data for debugging
      const sampleData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        open: 100 + Math.random() * 10,
        high: 110 + Math.random() * 10,
        low: 90 + Math.random() * 10,
        close: 105 + Math.random() * 10,
        volume: 1000
      }));
      setChartData(sampleData);
    }
  }, [assetId]);

  useEffect(() => {
    console.log('useEffect triggered with timePeriod:', timePeriod);
    fetchHistoricalData(timePeriod);
  }, [timePeriod, fetchHistoricalData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setColors({
        background: getComputedStyle(document.documentElement).getPropertyValue("--color-background") || '#ffffff',
        bullish: getComputedStyle(document.documentElement).getPropertyValue("--color-primary") || '#22c55e',
        bearish: getComputedStyle(document.documentElement).getPropertyValue("--color-secondary") || '#ef4444',
      });
    }
  }, []);

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
            <CartesianGrid strokeDasharray="3 3" stroke={colors.bullish + "1a"} />
            <XAxis 
              dataKey="date" 
              stroke={colors.bullish}
              tick={{ fill: colors.bullish }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              yAxisId="left" 
              stroke={colors.bullish}
              tick={{ fill: colors.bullish }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.bullish}`,
                color: colors.bullish,
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Legend />
            <ReferenceLine yAxisId="left" y={0} stroke={colors.bullish + "1a"} />
            
            {/* Add a line chart for the closing prices */}
            <Line
              type="monotone"
              dataKey="close"
              stroke={colors.bullish}
              strokeWidth={2}
              dot={false}
              yAxisId="left"
            />
            
            {/* Candlesticks */}
            {chartData.length > 0 && chartData.map((entry, index) => {
              const x = index * (500 / chartData.length);
              const candleWidth = Math.max(5, 500 / chartData.length - 2);

              return (
                <CustomCandlestick
                  key={index}
                  x={x}
                  y={(value: number) => {
                    const min = Math.min(...chartData.map(d => d.low));
                    const max = Math.max(...chartData.map(d => d.high));
                    const range = max - min;
                    return 450 - ((value - min) / range) * 400;
                  }}
                  width={candleWidth}
                  open={entry.open}
                  close={entry.close}
                  high={entry.high}
                  low={entry.low}
                  fill={colors.bullish}
                  stroke={colors.bearish}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
