"use client";

import React, { useEffect, useState, useCallback } from "react";
import "../styles/trade.css";
import strings from "../i18n/trade.json";
import { TRADE_CONFIG, CryptoData, TrendingCoin } from "../config/trade";
import Loading from "../utils/Loading";

export default function Trade() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [memecoinData, setMemecoinData] = useState<CryptoData[]>([]);
  const [trendingData, setTrendingData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const t = strings.en;

  const loadCachedData = useCallback(() => {
    try {
      const cachedCrypto = localStorage.getItem(
        TRADE_CONFIG.CACHE.KEYS.CRYPTO_DATA,
      );
      const cachedMemecoin = localStorage.getItem(
        TRADE_CONFIG.CACHE.KEYS.MEMECOIN_DATA,
      );
      const cachedTrending = localStorage.getItem(
        TRADE_CONFIG.CACHE.KEYS.TRENDING_DATA,
      );
      const cachedTimestamp = localStorage.getItem(
        TRADE_CONFIG.CACHE.KEYS.TIMESTAMP,
      );

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
          TRADE_CONFIG.CACHE.KEYS.CRYPTO_DATA,
          JSON.stringify(crypto),
        );
        localStorage.setItem(
          TRADE_CONFIG.CACHE.KEYS.MEMECOIN_DATA,
          JSON.stringify(memecoin),
        );
        localStorage.setItem(
          TRADE_CONFIG.CACHE.KEYS.TRENDING_DATA,
          JSON.stringify(trending),
        );
        localStorage.setItem(
          TRADE_CONFIG.CACHE.KEYS.TIMESTAMP,
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
            fetch(TRADE_CONFIG.API.CRYPTO_ENDPOINT),
            fetch(TRADE_CONFIG.API.MEMECOIN_ENDPOINT),
            fetch(TRADE_CONFIG.API.TRENDING_ENDPOINT),
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
          `${TRADE_CONFIG.API.CRYPTO_ENDPOINT.split("&")[0]}&ids=${trendingIds}&sparkline=true`,
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

    const cachedTimestamp = localStorage.getItem(
      TRADE_CONFIG.CACHE.KEYS.TIMESTAMP,
    );
    const lastUpdate = cachedTimestamp
      ? new Date(parseInt(cachedTimestamp))
      : null;
    const shouldFetch =
      !hasCachedData ||
      !lastUpdate ||
      Date.now() - lastUpdate.getTime() > TRADE_CONFIG.CACHE.DURATION;

    if (shouldFetch) {
      fetchCryptoData();
    }

    const interval = setInterval(fetchCryptoData, TRADE_CONFIG.CACHE.DURATION);
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
              <th className="table-header">{t.table.headers.ath}</th>
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
                        {TRADE_CONFIG.ICONS[crypto.symbol.toUpperCase()] ||
                          "🪙"}
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
                    {t.formatting.currency}
                    {
                      crypto.current_price
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })
                        .split(".")[0]
                    }
                    {t.formatting.decimalSeparator}
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
                    {t.formatting.decimalSeparator}
                    <span className="decimal-part">
                      {
                        Math.abs(crypto.price_change_percentage_24h)
                          .toFixed(2)
                          .split(".")[1]
                      }
                      {t.formatting.percentage}
                    </span>
                  </td>
                  <td
                    className={`table-cell crypto-market-cap-cell ${colorClass}`}
                  >
                    {t.formatting.currency}
                    {(crypto.market_cap / 1000000000).toFixed(2)}
                    {t.formatting.billion}
                  </td>
                  <td className={`table-cell crypto-ath-cell ${colorClass}`}>
                    {t.formatting.currency}
                    {crypto.ath.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                    <div className="ath-date">
                      {new Date(crypto.ath_date).toLocaleDateString()}
                    </div>
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
                            {t.chart.noData}
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
