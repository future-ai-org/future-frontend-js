"use client";

import { useEffect, useState, useCallback } from "react";
import "../styles/trade.css";
import strings from "../i18n/trade.json";
import { TRADE_CONFIG, CryptoData, TrendingCoin } from "../config/trade";
import { COINGECKO_CONFIG, CRYPTO_CONFIG } from "../config/coingecko";
import Loading from "../utils/loading";
import { FaStar, FaRegStar } from "react-icons/fa";

interface FavoriteAsset {
  id: string;
  symbol: string;
  name: string;
  addedAt: string;
}

export default function Trade() {
  const [trendingData, setTrendingData] = useState<CryptoData[]>([]);
  const [bluechipData, setBluechipData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteAsset[]>([]);

  const t = strings.en;

  const loadCachedData = useCallback(() => {
    try {
      const cachedTrending = localStorage.getItem(
        TRADE_CONFIG.CACHE.KEYS.TRENDING_DATA,
      );
      const cachedBluechip = localStorage.getItem(
        TRADE_CONFIG.BLUECHIP.CACHE_KEY,
      );

      if (cachedTrending) {
        const parsedTrending = JSON.parse(cachedTrending);
        let parsedBluechip = [];

        if (cachedBluechip) {
          try {
            parsedBluechip = JSON.parse(cachedBluechip);
          } catch (err) {
            console.error(t.error.cacheError, err);
          }
        }

        if (Array.isArray(parsedTrending)) {
          setTrendingData(parsedTrending);
          setBluechipData(Array.isArray(parsedBluechip) ? parsedBluechip : []);
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
    (trending: CryptoData[], bluechip: CryptoData[]) => {
      try {
        localStorage.setItem(
          TRADE_CONFIG.CACHE.KEYS.TRENDING_DATA,
          JSON.stringify(trending),
        );
        localStorage.setItem(
          TRADE_CONFIG.BLUECHIP.CACHE_KEY,
          JSON.stringify(bluechip),
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

        const trendingResponse = await fetch(
          TRADE_CONFIG.API.TRENDING_ENDPOINT,
        );

        let bluechipResponse;
        try {
          bluechipResponse = await fetch(TRADE_CONFIG.API.BLUECHIP_ENDPOINT);
        } catch (error) {
          console.error(t.error.fetchFailed, error);
          bluechipResponse = { ok: false, status: 0 };
        }

        if (!trendingResponse.ok || !bluechipResponse.ok) {
          throw new Error(t.error.apiErrorGeneric);
        }

        const trendingData = await trendingResponse.json();
        const bluechipData =
          "json" in bluechipResponse ? await bluechipResponse.json() : [];

        if (!trendingData.coins) {
          throw new Error(t.error.invalidDataGeneric);
        }

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
        const additionalCoinsResponse = await fetch(
          `${COINGECKO_CONFIG.BASE_URL}${COINGECKO_CONFIG.ENDPOINTS.MARKETS}?vs_currency=${CRYPTO_CONFIG.CURRENCY}&order=market_cap_desc&per_page=${TRADE_CONFIG.TRENDING.ADDITIONAL_COINS_LIMIT}&page=1&sparkline=true`,
        );

        let additionalCoins = [];
        if (additionalCoinsResponse.ok) {
          additionalCoins = await additionalCoinsResponse.json();
        }

        const trendingIdsSet = new Set(trendingIds.split(","));
        const bluechipIdsSet = new Set(
          TRADE_CONFIG.BLUECHIP.COINS as readonly string[],
        );

        const combinedTrending = [
          ...trendingDetails,
          ...additionalCoins.filter(
            (coin: CryptoData) =>
              !trendingIdsSet.has(coin.id) && !bluechipIdsSet.has(coin.id),
          ),
        ].slice(0, TRADE_CONFIG.TRENDING.MAX_ITEMS); // Limit to configured max items

        setTrendingData(combinedTrending);

        let finalBluechipData = [];
        if (Array.isArray(bluechipData) && bluechipData.length > 0) {
          finalBluechipData = bluechipData;
        } else {
          const fallbackResponse = await fetch(
            `${COINGECKO_CONFIG.BASE_URL}${COINGECKO_CONFIG.ENDPOINTS.MARKETS}?vs_currency=usd&ids=${TRADE_CONFIG.BLUECHIP.COINS.join(",")}&sparkline=true`,
          );
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            finalBluechipData = Array.isArray(fallbackData) ? fallbackData : [];
          }
        }

        setBluechipData(finalBluechipData);
        saveCachedData(trendingDetails, finalBluechipData);
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
  }, [loadCachedData, saveCachedData, t]);

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

  const trendingAssets = trendingData.filter(
    (crypto) => !bluechipData.some((bluechip) => bluechip.id === crypto.id),
  );

  const renderAssetTable = (assets: CryptoData[], sectionTitle: string) => {
    if (assets.length === 0) {
      return (
        <div key={sectionTitle} className="asset-section">
          <h2 className="section-title">{sectionTitle}</h2>
          <p>
            {t.messages.noDataAvailable} {sectionTitle}
          </p>
        </div>
      );
    }

    return (
      <div key={sectionTitle} className="asset-section">
        <h2 className="section-title">{sectionTitle}</h2>
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
            {assets.map((crypto) => {
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
                      <span className="crypto-full-name">
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
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {renderAssetTable(bluechipData, t.sections.bluechipAssets)}
      {renderAssetTable(trendingAssets, t.sections.trending)}
    </div>
  );
}
