"use client";

import React, { useState, useEffect } from "react";
import "../styles/home.css";
import strings from "../i18n/home.json";
import { useWeb3 } from "../contexts/Web3ModalContext";
import Link from "next/link";

export default function Home() {
  const { ensName, address, isConnected, connect } = useWeb3();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!mounted) {
    return (
      <div className="landing-container">
        <h1 className="landing-title">{strings.en.title.toUpperCase()}</h1>
        <h2 className="landing-subtitle">
          {strings.en.subtitle.toUpperCase()}
        </h2>
        <div className="landing-feature-grid">
          <div
            className={`landing-feature-card ${!isConnected ? "clickable" : ""}`}
            onClick={!isConnected ? connect : undefined}
            style={{ cursor: !isConnected ? "pointer" : "default" }}
          >
            <div className="landing-feature-number">I</div>
            <h3 className="landing-feature-title">
              {isConnected
                ? strings.en.features.one.signedIn.toUpperCase()
                : strings.en.features.one.title.toUpperCase()}
            </h3>
            <p className="landing-feature-description">
              {isConnected ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: `${strings.en.wallet.connectedAs.toUpperCase()} ${ensName || formatAddress(address)}`,
                  }}
                />
              ) : (
                strings.en.features.one.description.toUpperCase()
              )}
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-number">II</div>
            <h3 className="landing-feature-title">
              {strings.en.features.two.title.toUpperCase()}
            </h3>
            <div className="landing-feature-description" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link href="/logia" style={{ textDecoration: 'none' }}>
                <div className="landing-feature-action clickable" style={{ cursor: 'pointer' }}>
                  {strings.en.features.two.description.split('and')[0].trim()}
                </div>
              </Link>
              {isConnected && (
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <div className="landing-feature-action clickable" style={{ cursor: 'pointer' }}>
                    {strings.en.features.two.description.split('and')[1].trim()}
                  </div>
                </Link>
              )}
            </div>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-number">III</div>
            <h3 className="landing-feature-title">
              {strings.en.features.three.title.toUpperCase()}
            </h3>
            <p className="landing-feature-description">
              {strings.en.features.three.description.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <h1 className="landing-title">{strings.en.title.toUpperCase()}</h1>
      <h2 className="landing-subtitle">{strings.en.subtitle.toUpperCase()}</h2>
      <div className="landing-feature-grid">
        <div
          className={`landing-feature-card ${!isConnected ? "clickable" : ""}`}
          onClick={!isConnected ? connect : undefined}
          style={{ cursor: !isConnected ? "pointer" : "default" }}
        >
          <div className="landing-feature-number">I</div>
          <h3 className="landing-feature-title">
            {isConnected
              ? strings.en.features.one.signedIn.toLowerCase()
              : strings.en.features.one.title.toLowerCase()}
          </h3>
          <p className="landing-feature-description">
            {isConnected ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: `${strings.en.wallet.connectedAs.toLowerCase()} ${ensName || formatAddress(address)}`,
                }}
              />
            ) : (
              strings.en.features.one.description.toLowerCase()
            )}
          </p>
        </div>
        <div className="landing-feature-card">
          <div className="landing-feature-number">II</div>
          <h3 className="landing-feature-title">
            {strings.en.features.two.title.toLowerCase()}
          </h3>
          <p className="landing-feature-description">
            <a href="/logia">calculate your logia data</a>
            {isConnected && (
              <>
                {" and "}
                <a href="/dashboard">
                  {strings.en.features.two.description.split('and')[1].trim()}
                </a>
              </>
            )}
          </p>
        </div>
        <div className="landing-feature-card">
          <div className="landing-feature-number">III</div>
          <h3 className="landing-feature-title">
            {strings.en.features.three.title.toLowerCase()}
          </h3>
          <p className="landing-feature-description">
            {strings.en.features.three.description.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
