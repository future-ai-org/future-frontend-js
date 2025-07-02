"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "../utils/web3ModalContext";
import strings from "../i18n/dashboard.json";
import "../styles/dashboard.css";
import { formatDate, formatTime } from "../utils/geocoding";
import { getDuplicateCharts } from "../utils/chartUtils";
import {
  FaTrash,
  FaEye,
  FaStar,
  FaChartLine,
  FaCoins,
  FaHeart,
  FaMagic,
} from "react-icons/fa";

interface SavedChart {
  id: string;
  birthDate: string;
  birthTime: string;
  city: string;
  savedAt: string;
  isOfficial?: boolean;
  name: string;
}

interface FavoriteAsset {
  id: string;
  symbol: string;
  name: string;
  price?: number;
  change24h?: number;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [favoriteAssets, setFavoriteAssets] = useState<FavoriteAsset[]>([]);
  const {
    account,
    ensName,
    portfolio,
    totalPortfolioValue,
    portfolioChange24h,
    isConnected,
  } = useWeb3();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    const loadSavedCharts = () => {
      try {
        const charts = JSON.parse(localStorage.getItem("savedCharts") || "[]");
        setSavedCharts(charts);
      } catch (err) {
        console.error(strings.en.cards.logia.errors.loadFailed, err);
      }
    };

    loadSavedCharts();
    window.addEventListener("storage", loadSavedCharts);
    return () => window.removeEventListener("storage", loadSavedCharts);
  }, []);

  useEffect(() => {
    const loadFavoriteAssets = async () => {
      try {
        const assets = JSON.parse(
          localStorage.getItem("favoriteAssets") || "[]",
        );

        // Fetch price data for favorite assets
        if (assets.length > 0) {
          const assetIds = assets
            .map((asset: FavoriteAsset) => asset.id)
            .join(",");

          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${assetIds}&vs_currencies=usd&include_24hr_change=true`,
          );

          if (response.ok) {
            const priceData = await response.json();

            const assetsWithPrices = assets.map((asset: FavoriteAsset) => {
              const price = priceData[asset.id]?.usd || 0;
              const change24h = priceData[asset.id]?.usd_24h_change || 0;
              return {
                ...asset,
                price,
                change24h,
              };
            });
            setFavoriteAssets(assetsWithPrices);
          } else {
            setFavoriteAssets(assets);
          }
        } else {
          setFavoriteAssets(assets);
        }
      } catch (err) {
        console.error(strings.en.cards.favorites.errors.loadFailed, err);
        // Fallback to loading without price data
        try {
          const assets = JSON.parse(
            localStorage.getItem("favoriteAssets") || "[]",
          );
          setFavoriteAssets(assets);
        } catch (fallbackErr) {
          console.error("Fallback loading failed:", fallbackErr);
        }
      }
    };

    loadFavoriteAssets();
    window.addEventListener("storage", loadFavoriteAssets);
    window.addEventListener("favoritesUpdated", loadFavoriteAssets);

    // Set up refresh interval for price data (every 30 seconds)
    const interval = setInterval(loadFavoriteAssets, 30000);

    return () => {
      window.removeEventListener("storage", loadFavoriteAssets);
      window.removeEventListener("favoritesUpdated", loadFavoriteAssets);
      clearInterval(interval);
    };
  }, []);

  const handleDeleteChart = (chartId: string) => {
    try {
      const updatedCharts = savedCharts.filter((chart) => chart.id !== chartId);
      localStorage.setItem("savedCharts", JSON.stringify(updatedCharts));
      setSavedCharts(updatedCharts);
    } catch (err) {
      console.error(strings.en.cards.logia.errors.deleteFailed, err);
    }
  };

  const handleSetOfficial = (chartId: string) => {
    try {
      const chartToMakeOfficial = savedCharts.find(
        (chart) => chart.id === chartId,
      );
      if (!chartToMakeOfficial) return;

      const duplicateCharts = getDuplicateCharts(savedCharts, {
        birthDate: chartToMakeOfficial.birthDate,
        birthTime: chartToMakeOfficial.birthTime,
        city: chartToMakeOfficial.city,
        name: chartToMakeOfficial.name,
      }).filter((chart) => chart.id !== chartId);

      const updatedCharts = savedCharts
        .filter((chart) => !duplicateCharts.some((dup) => dup.id === chart.id))
        .map((chart) => ({
          ...chart,
          isOfficial: chart.id === chartId,
        }));

      localStorage.setItem("savedCharts", JSON.stringify(updatedCharts));
      setSavedCharts(updatedCharts);
    } catch (err) {
      console.error(strings.en.cards.logia.errors.setOfficialFailed, err);
    }
  };

  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 8)}`;
  };

  const getTimeBasedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    const isNight =
      hour >= strings.en.greeting.time.nightStart ||
      hour < strings.en.greeting.time.morningStart;
    return isNight ? strings.en.greeting.night : strings.en.greeting.morning;
  }, []);

  const formatBalance = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toFixed(8);
  };

  const formatCurrency = (value: number) => {
    const {
      locale,
      code,
      style,
      minimumFractionDigits,
      maximumFractionDigits,
    } = strings.en.formatting.currency;
    return new Intl.NumberFormat(locale, {
      style: style as "currency",
      currency: code,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const displayName = useMemo(
    () => ensName || formatAddress(account),
    [ensName, account],
  );

  const formattedGreeting = useMemo(() => {
    return strings.en.greeting.format
      .replace("{greeting}", getTimeBasedGreeting)
      .replace("{name}", displayName.toLowerCase());
  }, [getTimeBasedGreeting, displayName]);

  const handleRemoveFavorite = (assetId: string) => {
    const updatedFavorites = favoriteAssets.filter((fav) => fav.id !== assetId);
    setFavoriteAssets(updatedFavorites);
    localStorage.setItem("favoriteAssets", JSON.stringify(updatedFavorites));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{formattedGreeting}</h2>
      </div>

      <div className="dashboard-grid">
        {/* Portfolio Card */}
        <div className="dashboard-card">
          <h3>
            <FaCoins />
            {strings.en.portfolio.title}
          </h3>
          <div className="card-content">
            <div className="portfolio-summary">
              <div className="portfolio-summary-row">
                <span className="total-value">
                  {formatCurrency(totalPortfolioValue)}
                </span>
                <span
                  className={`portfolio-change ${portfolioChange24h >= 0 ? "positive-change" : "negative-change"}`}
                >
                  {formatPercentage(portfolioChange24h)}
                </span>
              </div>
            </div>
            <div className="portfolio-assets">
              {portfolio.map((asset) => (
                <div key={asset.symbol} className="portfolio-asset">
                  <div className="asset-info">
                    <p>
                      <span className="asset-symbol">{asset.name}</span>
                      <span className="chart-details">
                        {formatBalance(asset.balance)}{" "}
                        {asset.symbol.toLowerCase()}
                      </span>
                    </p>
                  </div>
                  <div className="asset-actions">
                    <div className="asset-value">
                      {formatCurrency(asset.value)}
                    </div>
                    <div
                      className={`asset-change ${asset.change24h >= 0 ? "positive-change" : "negative-change"}`}
                    >
                      {formatPercentage(asset.change24h)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logia Charts Card */}
        <div className="dashboard-card">
          <h3>
            <FaChartLine />
            {strings.en.cards.logia.title}
          </h3>
          <div className="card-content">
            {savedCharts.length === 0 ? (
              <p className="no-charts-message">
                {strings.en.cards.logia.noCharts}
              </p>
            ) : (
              <div className="saved-charts-list">
                {savedCharts
                  .sort((a, b) => {
                    const officialSort =
                      (b.isOfficial ? 1 : 0) - (a.isOfficial ? 1 : 0);
                    if (officialSort !== 0) return officialSort;

                    return (
                      new Date(b.savedAt).getTime() -
                      new Date(a.savedAt).getTime()
                    );
                  })
                  .map((chart) => (
                    <div key={chart.id} className="saved-chart-container">
                      <div className="saved-chart-item">
                        <p>
                          {chart.isOfficial && (
                            <span className="main-label">
                              {strings.en.cards.logia.main}
                            </span>
                          )}
                          <span className="chart-name">
                            {chart.name.toUpperCase()}
                          </span>
                          <span className="chart-details">
                            {formatDate(chart.birthDate)},{" "}
                            {formatTime(chart.birthTime)}
                          </span>
                        </p>
                      </div>
                      <div className="chart-actions">
                        {!chart.isOfficial && (
                          <button
                            onClick={() => handleSetOfficial(chart.id)}
                            className="set-official-button"
                            aria-label={strings.en.cards.logia.actions.makeMain}
                            title={strings.en.cards.logia.actions.makeMain}
                          >
                            <FaStar />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            router.push(`/logia/saved/${chart.id}`)
                          }
                          className="view-chart-button"
                          aria-label={strings.en.cards.logia.actions.view}
                          title={strings.en.cards.logia.actions.view}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDeleteChart(chart.id)}
                          className="delete-chart-button"
                          aria-label={strings.en.cards.logia.actions.delete}
                          title={strings.en.cards.logia.actions.delete}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Favorites Card */}
        <div className="dashboard-card">
          <h3>
            <FaHeart />
            {strings.en.cards.favorites.title}
          </h3>
          <div className="card-content">
            {favoriteAssets.length === 0 ? (
              <p className="no-favorites-message">
                {strings.en.cards.favorites.noFavorites}
              </p>
            ) : (
              <div className="favorite-assets-list">
                {favoriteAssets.map((asset) => (
                  <div key={asset.id} className="favorite-asset-item">
                    <div className="asset-info">
                      <p>
                        <span className="asset-symbol">{asset.name}</span>
                      </p>
                    </div>
                    <div className="asset-actions">
                      <div className="asset-value">
                        {asset.price ? formatCurrency(asset.price) : "—"}
                      </div>
                      <div
                        className={`asset-change ${asset.change24h && asset.change24h >= 0 ? "positive-change" : "negative-change"}`}
                      >
                        {asset.change24h
                          ? formatPercentage(asset.change24h)
                          : "—"}
                      </div>
                      <button
                        onClick={() => router.push(`/trade/${asset.id}`)}
                        className="view-asset-button"
                        aria-label={strings.en.cards.favorites.actions.view}
                        title={strings.en.cards.favorites.actions.view}
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(asset.id)}
                        className="remove-favorite-button"
                        aria-label={strings.en.cards.favorites.actions.remove}
                        title={strings.en.cards.favorites.actions.remove}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Predictions Card */}
        <div className="dashboard-card">
          <h3>
            <FaMagic />
            {strings.en.cards.predictions.title}
          </h3>
          <div className="card-content">
            <p className="no-favorites-message">
              {strings.en.cards.predictions.noPredictions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
