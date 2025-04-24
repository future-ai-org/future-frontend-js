"use client";

import React from "react";
import { useWeb3 } from "../contexts/Web3ModalContext";
import "../styles/dashboard.css";

const Dashboard: React.FC = () => {
  const {
    account,
    ensName,
    portfolio,
    totalPortfolioValue,
    portfolioChange24h,
    isConnected,
  } = useWeb3();

  console.log("Dashboard portfolio:", portfolio);
  console.log("Dashboard account:", account);
  console.log("Dashboard isConnected:", isConnected);
  console.log("Dashboard totalPortfolioValue:", totalPortfolioValue);

  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 8)}`;
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;
    return isNight ? "gn" : "gm";
  };

  const formatBalance = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toFixed(8);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>
          {getTimeBasedGreeting()},{" "}
          <span
            className="wallet-address"
            data-ens={ensName ? "true" : undefined}
          >
            {ensName || formatAddress(account)}
          </span>
        </h2>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>portfolio</h3>
          <div className="card-content">
            <div className="portfolio-summary">
              <p className="total-value">
                Total Value: {formatCurrency(totalPortfolioValue)}
              </p>
              <p
                className={`portfolio-change ${portfolioChange24h >= 0 ? "positive-change" : "negative-change"}`}
              >
                24h Change: {formatPercentage(portfolioChange24h)}
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
                      <span className="balance-symbol">{asset.symbol}</span>
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
      </div>
    </div>
  );
};

export default Dashboard;
