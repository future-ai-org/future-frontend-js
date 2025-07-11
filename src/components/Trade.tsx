"use client";

import { useEffect, useState, useCallback } from "react";
import "../styles/trade.css";
import strings from "../i18n/trade.json";
import { TRADE_CONFIG, CryptoData, TrendingCoin } from "../config/trade";
import Loading from "../utils/loading";
import { FaStar, FaRegStar } from "react-icons/fa";

interface FavoriteAsset {
  id: string;
  symbol: string;
  name: string;
  addedAt: string;
}

export default function Trade() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [trendingData, setTrendingData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteAsset[]>([]);

  const t = strings.en;

  const loadCachedData = useCallback(() => {
    try {
      const cachedCrypto = localStorage.getItem(
        TRADE_CONFIG.CACHE.KEYS.CRYPTO_DATA,
      );
      const cachedTrending = localStorage.getItem(
        TRADE_CONFIG.CACHE.KEYS.TRENDING_DATA,
      );
      const cachedTimestamp = localStorage.getItem(
        TRADE_CONFIG.CACHE.KEYS.TIMESTAMP,
      );

      if (cachedCrypto && cachedTrending && cachedTimestamp) {
        const parsedCrypto = JSON.parse(cachedCrypto);
        const parsedTrending = JSON.parse(cachedTrending);

        if (Array.isArray(parsedCrypto) && Array.isArray(parsedTrending)) {
          setCryptoData(parsedCrypto);
          setTrendingData(parsedTrending);
          setIsLoading(false);
          return true;
        }
      }
    } catch (err) {
      console.error(t.error.cacheError, err);
    }
    return false;
  }, [t.error.cacheError]);

  const saveCachedData = useCallback(
    (crypto: CryptoData[], trending: CryptoData[]) => {
      try {
        localStorage.setItem(
          TRADE_CONFIG.CACHE.KEYS.CRYPTO_DATA,
          JSON.stringify(crypto),
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
        console.error(t.error.saveCacheError, err);
      }
    },
    [t.error.saveCacheError],
  );

  useEffect(() => {
    const hasCachedData = loadCachedData();

    const fetchCryptoData = async () => {
      try {
        setIsLoading(true);
        const [cryptoResponse, trendingResponse] = await Promise.all([
          fetch(TRADE_CONFIG.API.CRYPTO_ENDPOINT),
          fetch(TRADE_CONFIG.API.TRENDING_ENDPOINT),
        ]);

        if (!cryptoResponse.ok || !trendingResponse.ok) {
          throw new Error(t.error.apiErrorGeneric);
        }

        const [cryptoData, trendingData] = await Promise.all([
          cryptoResponse.json(),
          trendingResponse.json(),
        ]);

        if (!Array.isArray(cryptoData) || !trendingData.coins) {
          throw new Error(t.error.invalidDataGeneric);
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
          throw new Error(t.error.trendingDataError);
        }

        const trendingDetails = await trendingDetailsResponse.json();

        setCryptoData(filteredData);
        setTrendingData(trendingDetails);
        saveCachedData(filteredData, trendingDetails);
      } catch (err) {
        console.error(t.error.fetchFailed, err);
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
  }, [
    loadCachedData,
    saveCachedData,
    t.error.apiErrorGeneric,
    t.error.fetchFailed,
    t.error.invalidDataGeneric,
    t.error.trendingDataError,
  ]);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const storedFavorites = JSON.parse(
          localStorage.getItem("favoriteAssets") || "[]",
        );
        setFavorites(storedFavorites);
      } catch (err) {
        console.error(t.error.loadFavoritesFailed, err);
      }
    };

    loadFavorites();
    window.addEventListener("storage", loadFavorites);
    return () => window.removeEventListener("storage", loadFavorites);
  }, [t.error.loadFavoritesFailed]);

  const handleToggleFavorite = (crypto: CryptoData) => {
    try {
      const isFavorite = favorites.some((fav) => fav.id === crypto.id);
      let updatedFavorites;

      if (isFavorite) {
        updatedFavorites = favorites.filter((fav) => fav.id !== crypto.id);
      } else {
        updatedFavorites = [
          ...favorites,
          {
            id: crypto.id,
            symbol: crypto.symbol.toUpperCase(),
            name: crypto.name,
            addedAt: new Date().toISOString(),
          },
        ];
      }

      localStorage.setItem("favoriteAssets", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (err) {
      console.error(t.error.saveFavoriteFailed, err);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Loading />
      </div>
    );
  }

  const allCryptoData = [...cryptoData, ...trendingData].filter(
    (crypto, index, self) =>
      index === self.findIndex((c) => c.id === crypto.id),
  );

  return (
    <div className="dashboard-container">
      {allCryptoData.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th className="table-header"></th>
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
              const isFavorite = favorites.some((fav) => fav.id === crypto.id);

              return (
                <tr className="table-row" key={crypto.id}>
                  <td className="table-cell">
                    <button
                      onClick={() => handleToggleFavorite(crypto)}
                      className={`favorite-button ${isFavorite ? "active" : ""}`}
                      aria-label={
                        isFavorite
                          ? t.asset.favorite.remove
                          : t.asset.favorite.add
                      }
                    >
                      {isFavorite ? <FaStar /> : <FaRegStar />}
                    </button>
                  </td>
                  <td className={`table-cell crypto-name-cell ${colorClass}`}>
                    <div className="crypto-name-content">
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
                      <a href={`/trade/${crypto.id}`} className="chart-link">
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
