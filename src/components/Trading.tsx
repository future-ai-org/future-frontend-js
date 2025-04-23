import React, { useEffect, useState, useCallback } from "react";
import {
  TradingData,
  API_CONFIG,
  CACHE_CONFIG,
  TRADING_CONFIG,
} from "../config/constants";
import strings from "../i18n/trading.json";
import { Loading } from "./Loading";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/trading.css";

interface TradingProps {
  assetId: string;
}

interface TradingViewWidgetConfig {
  symbol: string;
  theme: string;
  toolbar_bg: string;
  overrides: Record<string, string | number | boolean>;
  studies_overrides: Record<string, string | number | boolean>;
  container_id: string;
}

declare global {
  interface Window {
    TradingView: {
      widget: new (config: TradingViewWidgetConfig) => void;
    };
  }
}

export const Trading: React.FC<TradingProps> = ({ assetId }) => {
  const [tradingData, setTradingData] = useState<TradingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  const loadCachedData = useCallback(() => {
    const cachedData = localStorage.getItem(`cachedTradingData_${assetId}`);
    const cachedTimestamp = localStorage.getItem(
      `cachedTradingDataTimestamp_${assetId}`,
    );

    if (cachedData && cachedTimestamp) {
      const parsedData = JSON.parse(cachedData);
      const timestamp = parseInt(cachedTimestamp);

      if (Date.now() - timestamp < CACHE_CONFIG.DURATION) {
        setTradingData(parsedData);
        setIsLoading(false);
        return true;
      }
    }
    return false;
  }, [assetId]);

  const saveCachedData = useCallback(
    (data: TradingData) => {
      localStorage.setItem(
        `cachedTradingData_${assetId}`,
        JSON.stringify(data),
      );
      localStorage.setItem(
        `cachedTradingDataTimestamp_${assetId}`,
        Date.now().toString(),
      );
    },
    [assetId],
  );

  const fetchTradingData = useCallback(
    async (retryCount = 0) => {
      try {
        if (retryCount === 0 && loadCachedData()) {
          return;
        }

        if (!assetId) {
          setIsLoading(true);
          return;
        }

        const response = await fetch(
          API_CONFIG.COINGECKO.BASE_URL +
            API_CONFIG.COINGECKO.ENDPOINTS.COIN_DETAILS.replace(
              "{{id}}",
              assetId,
            ),
        );

        if (!response.ok) {
          if (retryCount < TRADING_CONFIG.MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
            setTimeout(() => fetchTradingData(retryCount + 1), delay);
          }
          return;
        }

        const data = await response.json();
        const tradingData = {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          current_price: data.market_data.current_price.usd,
          price_change_percentage_24h:
            data.market_data.price_change_percentage_24h,
          market_cap: data.market_data.market_cap.usd,
          total_volume: data.market_data.total_volume.usd,
          high_24h: data.market_data.high_24h.usd,
          low_24h: data.market_data.low_24h.usd,
          ath: data.market_data.ath.usd,
          ath_date: data.market_data.ath_date.usd,
          atl: data.market_data.atl.usd,
          atl_date: data.market_data.atl_date.usd,
        };

        setTradingData(tradingData);
        saveCachedData(tradingData);
      } catch (err) {
        if (retryCount < TRADING_CONFIG.MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          setTimeout(() => fetchTradingData(retryCount + 1), delay);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [assetId, loadCachedData, saveCachedData],
  );

  useEffect(() => {
    if (assetId) {
      fetchTradingData();
    }
  }, [assetId, fetchTradingData]);

  useEffect(() => {
    if (!tradingData) return;

    const initializeTrading = () => {
      if (!tradingData) return;
      new window.TradingView.widget({
        ...TRADING_CONFIG.WIDGET,
        theme: theme,
        toolbar_bg: getComputedStyle(document.documentElement).getPropertyValue(
          "--color-background",
        ),
        overrides: {
          ...TRADING_CONFIG.WIDGET.overrides,
          "paneProperties.background": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-background"),
          "scalesProperties.backgroundColor": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-background"),
          "mainSeriesProperties.candleStyle.upColor": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bullish"),
          "mainSeriesProperties.candleStyle.downColor": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bearish"),
          "mainSeriesProperties.candleStyle.borderUpColor": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bullish"),
          "mainSeriesProperties.candleStyle.borderDownColor": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bearish"),
          "mainSeriesProperties.candleStyle.wickUpColor": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bullish"),
          "mainSeriesProperties.candleStyle.wickDownColor": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bearish"),
          "paneProperties.vertGridProperties.color": `${getComputedStyle(document.documentElement).getPropertyValue("--color-bullish")}1a`,
          "paneProperties.horzGridProperties.color": `${getComputedStyle(document.documentElement).getPropertyValue("--color-bullish")}1a`,
          "scalesProperties.textColor": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bullish"),
          "mainSeriesProperties.background": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-background"),
          "mainSeriesProperties.gridColor": `${getComputedStyle(document.documentElement).getPropertyValue("--color-bullish")}1a`,
          "mainSeriesProperties.crossHairProperties.color": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bullish"),
          "mainSeriesProperties.crossHairProperties.width": 1,
          "mainSeriesProperties.crossHairProperties.style": 2,
          "mainSeriesProperties.crossHairProperties.visible": true,
          "mainSeriesProperties.crossHairProperties.labelBackgroundColor":
            getComputedStyle(document.documentElement).getPropertyValue(
              "--color-background",
            ),
        },
        studies_overrides: {
          "volume.volume.color.0": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bullish"),
          "volume.volume.color.1": getComputedStyle(
            document.documentElement,
          ).getPropertyValue("--color-bearish"),
          "volume.volume.transparency": 70,
        },
        symbol: `${TRADING_CONFIG.SYMBOL_FORMAT.EXCHANGE}${TRADING_CONFIG.SYMBOL_FORMAT.SEPARATOR}${tradingData.symbol.toUpperCase()}${TRADING_CONFIG.SYMBOL_FORMAT.QUOTE}`,
        container_id: "trading_widget",
      });
    };

    if (!document.getElementById(TRADING_CONFIG.SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = TRADING_CONFIG.SCRIPT_ID;
      script.src = TRADING_CONFIG.TRADING_SCRIPT;
      script.async = true;
      script.onload = initializeTrading;
      document.head.appendChild(script);
    } else {
      initializeTrading();
    }

    return () => {
      const script = document.getElementById(TRADING_CONFIG.SCRIPT_ID);
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, [tradingData, theme]);

  if (isLoading || !tradingData) {
    return (
      <div className="trading-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="trading-container">
      <h1>Trading {assetId}</h1>
      <table className="info-grid">
        <tbody>
          <tr>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.currentPrice}</div>
              <div className="info-value">
                ${tradingData?.current_price?.toLocaleString() ?? "N/A"}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">
                {strings.en.labels.priceChange24h}
              </div>
              <div
                className={`info-value ${tradingData?.price_change_percentage_24h >= 0 ? "price-change-positive" : "price-change-negative"}`}
              >
                {tradingData?.price_change_percentage_24h >= 0 ? "+" : ""}
                {tradingData?.price_change_percentage_24h?.toFixed(2) ?? "N/A"}%
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.marketCap}</div>
              <div className="info-value">
                ${tradingData?.market_cap?.toLocaleString() ?? "N/A"}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.volume24h}</div>
              <div className="info-value">
                ${tradingData?.total_volume?.toLocaleString() ?? "N/A"}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.high24h}</div>
              <div className="info-value">
                ${tradingData?.high_24h?.toLocaleString() ?? "N/A"}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.low24h}</div>
              <div className="info-value">
                ${tradingData?.low_24h?.toLocaleString() ?? "N/A"}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.allTimeHigh}</div>
              <div className="info-value">
                ${tradingData?.ath?.toLocaleString() ?? "N/A"}
              </div>
              <div className="info-label">
                {strings.en.labels.date}:{" "}
                {tradingData?.ath_date
                  ? new Date(tradingData.ath_date).toLocaleDateString()
                  : "N/A"}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.allTimeLow}</div>
              <div className="info-value">
                ${tradingData?.atl?.toLocaleString() ?? "N/A"}
              </div>
              <div className="info-label">
                {strings.en.labels.date}:{" "}
                {tradingData?.atl_date
                  ? new Date(tradingData.atl_date).toLocaleDateString()
                  : "N/A"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="trading-widget" id="trading_widget" />
    </div>
  );
};
