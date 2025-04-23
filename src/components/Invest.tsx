"use client";

import React, { useEffect, useState, useCallback } from "react";
import "../styles/invest.css";
import strings from "../i18n/invest.json";
import { API_CONFIG, CACHE_CONFIG, CRYPTO_CONFIG } from "../config/constants";
import { CRYPTO_ICONS } from "../config/cryptoIcons";
import { Loading } from "./Loading";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface TrendingCoin {
  item: {
    id: string;
  };
}

export default function Invest() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [memecoinData, setMemecoinData] = useState<CryptoData[]>([]);
  const [trendingData, setTrendingData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const t = strings.en;

  const loadCachedData = useCallback(() => {
    try {
      const cachedCrypto = localStorage.getItem(CACHE_CONFIG.KEYS.CRYPTO_DATA);
      const cachedMemecoin = localStorage.getItem(
        CACHE_CONFIG.KEYS.MEMECOIN_DATA,
      );
      const cachedTrending = localStorage.getItem(
        CACHE_CONFIG.KEYS.TRENDING_DATA,
      );
      const cachedTimestamp = localStorage.getItem(CACHE_CONFIG.KEYS.TIMESTAMP);

      if (cachedCrypto && cachedMemecoin && cachedTrending && cachedTimestamp) {
        const parsedCrypto = JSON.parse(cachedCrypto);
        const parsedMemecoin = JSON.parse(cachedMemecoin);
        const parsedTrending = JSON.parse(cachedTrending);

        if (
          Array.isArray(parsedCrypto) &&
          Array.isArray(parsedMemecoin) &&
          Array.isArray(parsedTrending)
        ) {
          setCryptoData(parsedCrypto);
          setMemecoinData(parsedMemecoin);
          setTrendingData(parsedTrending);
          setIsLoading(false);
          return true;
        }
      }
    } catch (err) {
      console.error("Cache error:", err);
    }
    return false;
  }, []);

  const saveCachedData = useCallback(
    (crypto: CryptoData[], memecoin: CryptoData[], trending: CryptoData[]) => {
      try {
        localStorage.setItem(
          CACHE_CONFIG.KEYS.CRYPTO_DATA,
          JSON.stringify(crypto),
        );
        localStorage.setItem(
          CACHE_CONFIG.KEYS.MEMECOIN_DATA,
          JSON.stringify(memecoin),
        );
        localStorage.setItem(
          CACHE_CONFIG.KEYS.TRENDING_DATA,
          JSON.stringify(trending),
        );
        localStorage.setItem(
          CACHE_CONFIG.KEYS.TIMESTAMP,
          Date.now().toString(),
        );
      } catch (err) {
        console.error("Save cache error:", err);
      }
    },
    [],
  );

  useEffect(() => {
    const hasCachedData = loadCachedData();

    const fetchCryptoData = async () => {
      try {
        setIsLoading(true);
        const [cryptoResponse, memecoinResponse, trendingResponse] =
          await Promise.all([
            fetch(
              `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}?vs_currency=${CRYPTO_CONFIG.CURRENCY}&order=${CRYPTO_CONFIG.ORDER_BY}&per_page=${CRYPTO_CONFIG.TOP_CRYPTO_COUNT}&page=1&sparkline=true`,
            ),
            fetch(
              `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}?vs_currency=${CRYPTO_CONFIG.CURRENCY}&ids=${CRYPTO_CONFIG.MEMECOIN_IDS.join(",")}&sparkline=true`,
            ),
            fetch(
              `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.SEARCH}`,
            ),
          ]);

        if (
          !cryptoResponse.ok ||
          !memecoinResponse.ok ||
          !trendingResponse.ok
        ) {
          throw new Error("API error");
        }

        const [cryptoData, memecoinData, trendingData] = await Promise.all([
          cryptoResponse.json(),
          memecoinResponse.json(),
          trendingResponse.json(),
        ]);

        if (
          !Array.isArray(cryptoData) ||
          !Array.isArray(memecoinData) ||
          !trendingData.coins
        ) {
          throw new Error("Invalid data");
        }

        const filteredData = cryptoData.filter(
          (crypto) => crypto.id !== "dogecoin",
        );
        const trendingIds = trendingData.coins
          .map((coin: TrendingCoin) => coin.item.id)
          .join(",");

        const trendingDetailsResponse = await fetch(
          `${API_CONFIG.COINGECKO.BASE_URL}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}?vs_currency=${CRYPTO_CONFIG.CURRENCY}&ids=${trendingIds}&sparkline=true`,
        );

        if (!trendingDetailsResponse.ok) {
          throw new Error("Trending data error");
        }

        const trendingDetails = await trendingDetailsResponse.json();

        setCryptoData(filteredData);
        setMemecoinData(memecoinData);
        setTrendingData(trendingDetails);
        saveCachedData(filteredData, memecoinData, trendingDetails);
      } catch (err) {
        console.error("Failed to fetch fresh data:", err);
        if (!hasCachedData) {
          setIsLoading(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const cachedTimestamp = localStorage.getItem(CACHE_CONFIG.KEYS.TIMESTAMP);
    const lastUpdate = cachedTimestamp
      ? new Date(parseInt(cachedTimestamp))
      : null;
    const shouldFetch =
      !hasCachedData ||
      !lastUpdate ||
      Date.now() - lastUpdate.getTime() > CACHE_CONFIG.DURATION;

    if (shouldFetch) {
      fetchCryptoData();
    }

    const interval = setInterval(fetchCryptoData, CACHE_CONFIG.DURATION);
    return () => clearInterval(interval);
  }, [loadCachedData, saveCachedData]);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Loading />
      </div>
    );
  }

  const allCryptoData = [
    ...cryptoData,
    ...memecoinData,
    ...trendingData,
  ].filter(
    (crypto, index, self) =>
      index === self.findIndex((c) => c.id === crypto.id),
  );

  return (
    <div className="dashboard-container">
      {allCryptoData.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">{t.table.headers.asset}</th>
              <th className="table-header">{t.table.headers.price}</th>
              <th className="table-header">{t.table.headers.change}</th>
              <th className="table-header">{t.table.headers.marketCap}</th>
              <th className="table-header">{t.table.headers.chart}</th>
            </tr>
          </thead>
          <tbody>
            {allCryptoData.map((crypto) => {
              const isPositive = crypto.price_change_percentage_24h >= 0;
              const colorClass = isPositive ? "positive" : "negative";

              return (
                <tr className="table-row" key={crypto.id}>
                  <td className={`table-cell crypto-name-cell ${colorClass}`}>
                    <div className="crypto-name-content">
                      <span className={`crypto-icon ${colorClass}`}>
                        {CRYPTO_ICONS[crypto.symbol.toUpperCase()] || "🪙"}
                      </span>
                      <span
                        className="crypto-full-name"
                        data-fullname={`${crypto.name} (${crypto.symbol.toUpperCase()})`}
                      >
                        {crypto.name}{" "}
                        <span className="symbol">
                          ({crypto.symbol.toUpperCase()})
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className={`table-cell crypto-price-cell ${colorClass}`}>
                    $
                    {
                      crypto.current_price
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })
                        .split(".")[0]
                    }
                    .
                    <span className="decimal-part">
                      {
                        crypto.current_price
                          .toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })
                          .split(".")[1]
                      }
                    </span>
                  </td>
                  <td className={`table-cell crypto-change-cell ${colorClass}`}>
                    <span className={`glowing-emoji ${colorClass}`}>
                      {isPositive ? "↗" : "↘"}
                    </span>
                    {
                      Math.abs(crypto.price_change_percentage_24h)
                        .toFixed(2)
                        .split(".")[0]
                    }
                    .
                    <span className="decimal-part">
                      {
                        Math.abs(crypto.price_change_percentage_24h)
                          .toFixed(2)
                          .split(".")[1]
                      }
                      %
                    </span>
                  </td>
                  <td
                    className={`table-cell crypto-market-cap-cell ${colorClass}`}
                  >
                    ${(crypto.market_cap / 1000000000).toFixed(2)}B
                  </td>
                  <td className="table-cell">
                    {crypto.sparkline_in_7d?.price ? (
                      <a href={`/trading/${crypto.id}`} className="chart-link">
                        <div className="chart-container">
                          <svg viewBox="0 0 120 30">
                            <polyline
                              points={(() => {
                                const prices = crypto.sparkline_in_7d!.price;
                                const min = Math.min(...prices);
                                const max = Math.max(...prices);
                                const range = max - min || 1;
                                return prices
                                  .map((price, i) => {
                                    const x = (i / (prices.length - 1)) * 120;
                                    const y = 30 - ((price - min) / range) * 30;
                                    return `${x},${y}`;
                                  })
                                  .join(" ");
                              })()}
                              className={colorClass}
                            />
                          </svg>
                        </div>
                      </a>
                    ) : (
                      <div className="chart-container">
                        <svg viewBox="0 0 100 30">
                          <text x="60" y="15" className={colorClass}>
                            No data
                          </text>
                        </svg>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
