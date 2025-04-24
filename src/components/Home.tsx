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
          <div className="landing-feature-card">
            <div className="landing-feature-number">I</div>
            <h3 className="landing-feature-title">
              {isConnected
                ? strings.en.features.one.signedIn.replace(
                    "{ensName}",
                    ensName || formatAddress(address),
                  )
                : strings.en.features.one.title.toUpperCase()}
            </h3>
            <p className="landing-feature-description">
              {isConnected ? (
                <span>
                  {strings.en.hello.connectedAs.split("reading the about")[0]}
                  <Link href="/about">reading the about</Link>
                  {strings.en.hello.connectedAs.split("reading the about")[1]}
                </span>
              ) : (
                <span onClick={() => connect()}>
                  {strings.en.features.one.description}
                </span>
              )}
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-number">II</div>
            <h3 className="landing-feature-title">
              {strings.en.features.two.title.toUpperCase()}
            </h3>
            <p className="landing-feature-description">
              <Link href="/logia">
                {strings.en.features.two.description.split("and")[0].trim()}
              </Link>
              {isConnected && (
                <>
                  {" and "}
                  <Link href="/dashboard">
                    {strings.en.features.two.description.split("and")[1].trim()}
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-number">III</div>
            <h3 className="landing-feature-title">
              {strings.en.features.three.title.toUpperCase()}
            </h3>
            <p className="landing-feature-description">
              leverage smart <Link href="/predict">predictive</Link> intel from
              our oracle agents
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
        <div className="landing-feature-card">
          <div className="landing-feature-number">I</div>
          <h3 className="landing-feature-title">
            {isConnected
              ? strings.en.features.one.signedIn.replace(
                  "{ensName}",
                  ensName || formatAddress(address),
                )
              : strings.en.features.one.title.toLowerCase()}
          </h3>
          <p className="landing-feature-description">
            {isConnected ? (
              <span>
                {strings.en.hello.connectedAs.split("reading the about")[0]}
                <Link href="/about">reading the about</Link>
                {strings.en.hello.connectedAs.split("reading the about")[1]}
              </span>
            ) : (
              <span onClick={() => connect()}>
                {strings.en.features.one.description}
              </span>
            )}
          </p>
        </div>
        <div className="landing-feature-card">
          <div className="landing-feature-number">II</div>
          <h3 className="landing-feature-title">
            {strings.en.features.two.title.toLowerCase()}
          </h3>
          <p className="landing-feature-description">
            <Link href="/logia">
              {strings.en.features.two.description.split("and")[0].trim()}
            </Link>
            {isConnected && (
              <>
                {" and "}
                <Link href="/dashboard">
                  {strings.en.features.two.description.split("and")[1].trim()}
                </Link>
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
            leverage smart <Link href="/predict">predictive</Link> intel from
            our oracle agents
          </p>
        </div>
      </div>
    </div>
  );
}
