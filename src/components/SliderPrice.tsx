"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/slider_price.module.css";
import { PRICE_SLIDER_CONFIG } from "../config/slider_prices";
import sliderPriceI18n from "../i18n/slider_price.json";

interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
}

interface CoinGeckoPriceData {
  usd: number;
  usd_24h_change: number;
}

const formatPrice = (price: number): string => {
  // For prices less than 1, show up to 6 decimal places
  if (price < 1) {
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`;
  }
  // For prices between 1 and 100, show 2 decimal places
  if (price < 100) {
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  // For prices 100 and above, show 0 decimal places
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatChange = (change: number): string => {
  return `${change >= 0 ? "↗" : "↘"} ${Math.abs(change).toFixed(2)}%`;
};

const getCachedPrices = (): CryptoPrice[] | null => {
  try {
    const cached = localStorage.getItem(PRICE_SLIDER_CONFIG.CACHE.KEY);
    if (!cached) return null;

    const { prices, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > PRICE_SLIDER_CONFIG.CACHE.DURATION) {
      localStorage.removeItem(PRICE_SLIDER_CONFIG.CACHE.KEY);
      return null;
    }

    return prices;
  } catch {
    return null;
  }
};

const setCachedPrices = (prices: CryptoPrice[]) => {
  try {
    const cacheData = {
      prices,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      PRICE_SLIDER_CONFIG.CACHE.KEY,
      JSON.stringify(cacheData),
    );
  } catch (error) {
    console.error(sliderPriceI18n.en.errors.cacheFailed, error);
  }
};

export const SliderPrice: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>(
    () => getCachedPrices() || [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ids: PRICE_SLIDER_CONFIG.API.PARAMS.ids,
        vs_currencies: PRICE_SLIDER_CONFIG.API.PARAMS.vs_currencies,
        include_24hr_change:
          PRICE_SLIDER_CONFIG.API.PARAMS.include_24hr_change.toString(),
      });

      const response = await fetch(
        `${PRICE_SLIDER_CONFIG.API.URL}?${queryParams}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const formattedPrices = Object.entries(
        data as Record<string, CoinGeckoPriceData>,
      ).map(([id, price]) => ({
        symbol: id.toUpperCase(),
        price: price.usd,
        change: price.usd_24h_change,
      }));

      setPrices(formattedPrices);
      setCachedPrices(formattedPrices);
    } catch (error) {
      console.error(sliderPriceI18n.en.errors.fetchFailed, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(
      fetchPrices,
      PRICE_SLIDER_CONFIG.REFRESH_INTERVAL,
    );
    return () => clearInterval(interval);
  }, []);

  if (isLoading && prices.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.loading}>
          {sliderPriceI18n.en.errors.loading}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.priceItemsContainer}>
        {[...prices, ...prices].map((price, index) => (
          <div
            key={`${price.symbol}-${index}`}
            className={`${styles.priceItem} ${
              price.change >= 0 ? styles.positive : styles.negative
            }`}
          >
            <span className={styles.symbol}>{price.symbol}</span>
            <span className={styles.price}>{formatPrice(price.price)}</span>
            <span className={styles.change}>{formatChange(price.change)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
