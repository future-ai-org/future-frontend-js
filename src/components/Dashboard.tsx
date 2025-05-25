"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "../utils/web3ModalContext";
import strings from "../i18n/dashboard.json";
import "../styles/dashboard.css";
import { formatDate, formatTime } from "../utils/geocoding";
import { FaTrash } from 'react-icons/fa';

interface SavedChart {
  id: string;
  birthDate: string;
  birthTime: string;
  city: string;
  chartData: any;
  savedAt: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
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
        const charts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
        setSavedCharts(charts);
      } catch (err) {
        console.error('Failed to load saved charts:', err);
      }
    };

    loadSavedCharts();
    // Listen for storage changes
    window.addEventListener('storage', loadSavedCharts);
    return () => window.removeEventListener('storage', loadSavedCharts);
  }, []);

  const handleDeleteChart = (chartId: string) => {
    try {
      const updatedCharts = savedCharts.filter(chart => chart.id !== chartId);
      localStorage.setItem('savedCharts', JSON.stringify(updatedCharts));
      setSavedCharts(updatedCharts);
    } catch (err) {
      console.error('Failed to delete chart:', err);
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{formattedGreeting}</h2>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>{strings.en.portfolio.title}</h3>
          <div className="card-content">
            <div className="portfolio-summary">
              <p className="total-value">
                {strings.en.portfolio.totalValue.toLowerCase()}:{" "}
                {formatCurrency(totalPortfolioValue)}
              </p>
              <p
                className={`portfolio-change ${portfolioChange24h >= 0 ? "positive-change" : "negative-change"}`}
              >
                {strings.en.portfolio.change24h.toLowerCase()}:{" "}
                {formatPercentage(portfolioChange24h)}
              </p>
            </div>
            <div className="portfolio-assets">
              {portfolio.map((asset) => (
                <div key={asset.symbol} className="portfolio-asset">
                  <div className="asset-details">
                    <div className="asset-balance">
                      <span className="balance-amount">
                        {formatBalance(asset.balance)}
                      </span>
                      <span className="balance-symbol">
                        {asset.symbol.toLowerCase()}
                      </span>
                    </div>
                    <div className="asset-value">
                      {formatCurrency(asset.value)}
                    </div>
                  </div>
                  <div
                    className={`asset-change ${asset.change24h >= 0 ? "positive-change" : "negative-change"}`}
                  >
                    {formatPercentage(asset.change24h)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>{strings.en.cards.logia.title}</h3>
          <div className="card-content">
            {savedCharts.length === 0 ? (
              <p className="no-charts-message">No saved charts yet</p>
            ) : (
              <div className="saved-charts-list">
                {savedCharts.map((chart) => (
                  <div key={chart.id} className="saved-chart-item">
                    <div className="chart-info">
                      <h4>{chart.city}</h4>
                      <p>Birth Date: {formatDate(chart.birthDate)}</p>
                      <p>Birth Time: {formatTime(chart.birthTime)}</p>
                      <p>Saved: {new Date(chart.savedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="chart-actions">
                      <button 
                        onClick={() => router.push(`/logia/saved/${chart.id}`)}
                        className="view-chart-button"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleDeleteChart(chart.id)}
                        className="delete-chart-button"
                        aria-label="Delete chart"
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

        <div className="dashboard-card">
          <h3>{strings.en.cards.favorites.title}</h3>
          <div className="card-content">
            {/* Favorite assets content will go here */}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>{strings.en.cards.predictions.title}</h3>
          <div className="card-content">
            {/* Predictions content will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
