import React from "react";
import "../styles/home.css";
import strings from "../i18n/home.json";
import { useWeb3 } from "../contexts/Web3ModalContext";

export const Home: React.FC = () => {
  const { ensName, address, isConnected } = useWeb3();

  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="landing-container">
      <h1 className="landing-title">{strings.en.title}</h1>
      <h2 className="landing-subtitle">{strings.en.subtitle}</h2>
      {isConnected && (
        <div className="wallet-info">
          <span className="wallet-label">Connected as:</span>
          <span className="wallet-address">
            {ensName || formatAddress(address)}
          </span>
        </div>
      )}
      <div className="landing-feature-grid">
        <div className="landing-feature-card">
          <h3 className="landing-feature-title">
            {strings.en.features.one.title}
          </h3>
          <p className="landing-feature-description">
            {strings.en.features.one.description}
          </p>
        </div>
        <div className="landing-feature-card">
          <h3 className="landing-feature-title">
            {strings.en.features.two.title}
          </h3>
          <p className="landing-feature-description">
            {strings.en.features.two.description}
          </p>
        </div>
        <div className="landing-feature-card">
          <h3 className="landing-feature-title">
            {strings.en.features.three.title}
          </h3>
          <p className="landing-feature-description">
            {strings.en.features.three.description}
          </p>
        </div>
      </div>
    </div>
  );
};
