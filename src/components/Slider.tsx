"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import "../styles/slider.css";
import pricesData from "../i18n/slider.json";
import { PRICE_SLIDER_CONFIG } from "../config/price-slider";

interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
}

interface CoinData {
  current_price: number;
  symbol: string;
  price_change_percentage_24h?: number;
}

const formatPrice = (price: number): string => {
  const isSmallPrice = price < 1;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: PRICE_SLIDER_CONFIG.PRICE_FORMAT.MIN_FRACTION_DIGITS,
    maximumFractionDigits: isSmallPrice 
      ? PRICE_SLIDER_CONFIG.PRICE_FORMAT.MAX_FRACTION_DIGITS.SMALL
      : PRICE_SLIDER_CONFIG.PRICE_FORMAT.MAX_FRACTION_DIGITS.LARGE,
  });
};

const formatChange = (change: number): string => {
  return `${change >= 0 ? "↑" : "↓"} ${Math.abs(change).toFixed(2)}%`;
};

const renderItem = (crypto: CryptoPrice | null, index: number) => {
  const isPositive = crypto?.change !== undefined && crypto.change >= 0;
  const symbol = crypto?.symbol || "---";
  const price = crypto ? formatPrice(crypto.price) : "$0.00";
  const change = crypto ? formatChange(crypto.change) : "↑ 0.00%";

  return (
    <div
      className={`price-item ${crypto ? (isPositive ? "positive" : "negative") : "loading"}`}
      key={`${crypto ? `${crypto.symbol}-` : "loading-"}${index}`}
    >
      <span className="symbol">{symbol}/USDT</span>
      <span className="price">{price}</span>
      <span className="price-change">{change}</span>
    </div>
  );
};

export const Slider: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrices = useCallback(
    async (isRetry = false) => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          vs_currency: PRICE_SLIDER_CONFIG.API.PARAMS.VS_CURRENCY,
          ids: PRICE_SLIDER_CONFIG.API.CRYPTO_IDS.join(","),
          order: PRICE_SLIDER_CONFIG.API.PARAMS.ORDER,
          per_page: PRICE_SLIDER_CONFIG.API.PARAMS.PER_PAGE.toString(),
          page: PRICE_SLIDER_CONFIG.API.PARAMS.PAGE.toString(),
          sparkline: PRICE_SLIDER_CONFIG.API.PARAMS.SPARKLINE.toString(),
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `${PRICE_SLIDER_CONFIG.API.URL}?${queryParams.toString()}`,
          { signal: controller.signal },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            pricesData.en.errors.httpError.replace(
              "{status}",
              response.status.toString(),
            ),
          );
        }

        const data = await response.json();
        const formattedPrices = data
          .filter((coin: CoinData) => coin.current_price > 0 && coin.symbol.toUpperCase() !== "USDT")
          .map((coin: CoinData) => ({
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            change: coin.price_change_percentage_24h || 0,
          }));

        if (formattedPrices.length === 0) {
          throw new Error(pricesData.en.errors.noValidPrices);
        }

        setPrices(formattedPrices);
        if (isRetry) {
          setRetryCount(0);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching prices:", error);

        if (retryCount < PRICE_SLIDER_CONFIG.MAX_RETRIES) {
          const delay = Math.min(
            PRICE_SLIDER_CONFIG.RETRY_DELAY.BASE * Math.pow(2, retryCount),
            PRICE_SLIDER_CONFIG.RETRY_DELAY.MAX,
          );
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchPrices(true);
          }, delay);
        }
      }
    },
    [retryCount],
  );

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(
      fetchPrices,
      PRICE_SLIDER_CONFIG.REFRESH_INTERVAL,
    );
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const validPrices = useMemo(
    () => prices.filter((price) => price.price > 0),
    [prices],
  );

  const duplicatedPrices = useMemo(
    () =>
      Array(PRICE_SLIDER_CONFIG.DUPLICATION_FACTOR * 2)
        .fill(validPrices)
        .flat(),
    [validPrices],
  );

  const displayPrices = isLoading ? Array(20).fill(null) : duplicatedPrices;

  return (
    <div className="slider-container">
      <div className="price-items-container">
        {displayPrices.map((price, index) => renderItem(price, index))}
      </div>
    </div>
  );
};
