import React, { useEffect, useState, useMemo, useCallback } from "react";
import "../styles/slider.css";
import pricesData from "../i18n/slider.json";
import { PRICE_SLIDER_CONFIG } from "../config/constants";

interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
}

const formatPrice = (price: number): string => {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: PRICE_SLIDER_CONFIG.PRICE_FORMAT.MIN_FRACTION_DIGITS,
    maximumFractionDigits:
      price < 1
        ? PRICE_SLIDER_CONFIG.PRICE_FORMAT.MAX_FRACTION_DIGITS.SMALL
        : PRICE_SLIDER_CONFIG.PRICE_FORMAT.MAX_FRACTION_DIGITS.LARGE,
  });
};

const formatChange = (change: number): string => {
  return `${change >= 0 ? "↑" : "↓"} ${Math.abs(change).toFixed(2)}%`;
};

export const Slider: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPrices = useCallback(
    async (isRetry = false) => {
      try {
        const queryParams = new URLSearchParams({
          vs_currency: PRICE_SLIDER_CONFIG.API.PARAMS.VS_CURRENCY,
          ids: PRICE_SLIDER_CONFIG.API.CRYPTO_IDS.join(","),
          order: PRICE_SLIDER_CONFIG.API.PARAMS.ORDER,
          per_page: PRICE_SLIDER_CONFIG.API.PARAMS.PER_PAGE.toString(),
          page: PRICE_SLIDER_CONFIG.API.PARAMS.PAGE.toString(),
          sparkline: PRICE_SLIDER_CONFIG.API.PARAMS.SPARKLINE.toString(),
        });

        const response = await fetch(
          `${PRICE_SLIDER_CONFIG.API.URL}?${queryParams.toString()}`,
        );

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
          .filter(
            (coin: any) =>
              coin.current_price > 0 && coin.symbol.toUpperCase() !== "USDT",
          )
          .map((coin: any) => ({
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
      Array(PRICE_SLIDER_CONFIG.DUPLICATION_FACTOR).fill(validPrices).flat(),
    [validPrices],
  );

  const renderPriceItem = useCallback(
    (crypto: CryptoPrice, index: number) => (
      <div
        className={`price-item ${crypto.change >= 0 ? "positive" : "negative"}`}
        key={`${crypto.symbol}-${index}`}
      >
        <span className="symbol">{crypto.symbol}/USDT</span>
        <span className="price">{formatPrice(crypto.price)}</span>
        <span className="price-change">{formatChange(crypto.change)}</span>
      </div>
    ),
    [],
  );

  const displayPrices = useMemo(
    () => (validPrices.length === 0 ? [] : duplicatedPrices),
    [validPrices, duplicatedPrices],
  );

  return (
    <div className="slider-container">
      <div className="price-items-container">
        {displayPrices.map(renderPriceItem)}
      </div>
    </div>
  );
};
