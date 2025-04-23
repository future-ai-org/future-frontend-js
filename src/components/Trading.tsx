import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  TradingData,
  API_CONFIG,
  CACHE_CONFIG,
  TRADING_CONFIG,
} from "../config/constants";
import strings from "../i18n/trading.json";
import { Loading } from "./Loading";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/colors";
import "../styles/trading.css";

export const Trading: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
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
      const currentThemeColors = colors[theme];
      new (window as any).TradingView.widget({
        ...TRADING_CONFIG.WIDGET,
        theme: theme,
        toolbar_bg: currentThemeColors.background,
        overrides: {
          ...TRADING_CONFIG.WIDGET.overrides,
          "paneProperties.background": currentThemeColors.background,
          "scalesProperties.backgroundColor": currentThemeColors.background,
          "mainSeriesProperties.candleStyle.upColor":
            currentThemeColors.bullish,
          "mainSeriesProperties.candleStyle.downColor":
            currentThemeColors.bearish,
          "mainSeriesProperties.candleStyle.borderUpColor":
            currentThemeColors.bullish,
          "mainSeriesProperties.candleStyle.borderDownColor":
            currentThemeColors.bearish,
          "mainSeriesProperties.candleStyle.wickUpColor":
            currentThemeColors.bullish,
          "mainSeriesProperties.candleStyle.wickDownColor":
            currentThemeColors.bearish,
          "paneProperties.vertGridProperties.color": `${currentThemeColors.bullish}1a`,
          "paneProperties.horzGridProperties.color": `${currentThemeColors.bullish}1a`,
          "scalesProperties.textColor": currentThemeColors.bullish,
          "mainSeriesProperties.background": currentThemeColors.background,
          "mainSeriesProperties.gridColor": `${currentThemeColors.bullish}1a`,
          "mainSeriesProperties.crossHairProperties.color":
            currentThemeColors.bullish,
          "mainSeriesProperties.crossHairProperties.width": 1,
          "mainSeriesProperties.crossHairProperties.style": 2,
          "mainSeriesProperties.crossHairProperties.visible": true,
          "mainSeriesProperties.crossHairProperties.labelBackgroundColor":
            currentThemeColors.background,
        },
        studies_overrides: {
          "volume.volume.color.0": currentThemeColors.bullish,
          "volume.volume.color.1": currentThemeColors.bearish,
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
      <table className="info-grid">
        <tbody>
          <tr>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.currentPrice}</div>
              <div className="info-value">
                ${tradingData.current_price.toLocaleString()}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">
                {strings.en.labels.priceChange24h}
              </div>
              <div
                className={`info-value ${tradingData.price_change_percentage_24h >= 0 ? "price-change-positive" : "price-change-negative"}`}
              >
                {tradingData.price_change_percentage_24h >= 0 ? "+" : ""}
                {tradingData.price_change_percentage_24h.toFixed(2)}%
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.marketCap}</div>
              <div className="info-value">
                ${tradingData.market_cap.toLocaleString()}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.volume24h}</div>
              <div className="info-value">
                ${tradingData.total_volume.toLocaleString()}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.high24h}</div>
              <div className="info-value">
                ${tradingData.high_24h.toLocaleString()}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.low24h}</div>
              <div className="info-value">
                ${tradingData.low_24h.toLocaleString()}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.allTimeHigh}</div>
              <div className="info-value">
                ${tradingData.ath.toLocaleString()}
              </div>
              <div className="info-label">
                {strings.en.labels.date}:{" "}
                {new Date(tradingData.ath_date).toLocaleDateString()}
              </div>
            </td>
            <td className="info-card">
              <div className="info-label">{strings.en.labels.allTimeLow}</div>
              <div className="info-value">
                ${tradingData.atl.toLocaleString()}
              </div>
              <div className="info-label">
                {strings.en.labels.date}:{" "}
                {new Date(tradingData.atl_date).toLocaleDateString()}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="trading-widget" id="trading_widget" />
    </div>
  );
};
