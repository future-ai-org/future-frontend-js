"use client";

import React from "react";
import "../styles/home.css";
import strings from "../i18n/home.json";
import { useWeb3 } from "../contexts/Web3ModalContext";
import Link from "next/link";

const FeatureCard = ({
  number,
  title,
  description,
  isConnected,
  ensName,
  address,
}: {
  number: string;
  title: string;
  description: React.ReactNode;
  isConnected: boolean;
  ensName?: string | null;
  address?: string;
}) => {
  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const displayTitle =
    isConnected && number === strings.en.numbers.one
      ? strings.en.features.one.signedIn.replace(
          "{ensName}",
          ensName || formatAddress(address),
        )
      : title;

  return (
    <div className="landing-feature-card">
      <div className="landing-feature-number">{number}</div>
      <h3 className="landing-feature-title">{displayTitle}</h3>
      <p className="landing-feature-description">{description}</p>
    </div>
  );
};

export default function Home() {
  const { ensName, address, isConnected, connect } = useWeb3();

  const renderFeatureCards = () => (
    <div className="landing-feature-grid">
      <FeatureCard
        number={strings.en.numbers.one}
        title={strings.en.features.one.title.toLowerCase()}
        description={
          isConnected ? (
            <span>
              {strings.en.hello.connectedAs.prefix}{" "}
              <Link href="/info">{strings.en.hello.connectedAs.link}</Link>{" "}
              {strings.en.hello.connectedAs.suffix}
            </span>
          ) : (
            <span onClick={() => connect()}>
              {strings.en.features.one.description}
            </span>
          )
        }
        isConnected={isConnected}
        ensName={ensName}
        address={address}
      />
      <FeatureCard
        number={strings.en.numbers.two}
        title={strings.en.features.two.title.toLowerCase()}
        description={
          <>
            <Link href="/logia">{strings.en.links.logia}</Link>
            {isConnected && (
              <>
                {strings.en.text.and}
                <Link href="/dashboard">{strings.en.links.dashboard}</Link>
              </>
            )}
          </>
        }
        isConnected={isConnected}
      />
      <FeatureCard
        number={strings.en.numbers.three}
        title={strings.en.features.three.title.toLowerCase()}
        description={
          <>
            <Link href="/predict">{strings.en.links.predict}</Link>{" "}
            {strings.en.text.intelFromOracle}
          </>
        }
        isConnected={isConnected}
      />
    </div>
  );

  return (
    <div className="landing-container">
      <h1 className="landing-title">{strings.en.title.toUpperCase()}</h1>
      <h2 className="landing-subtitle">{strings.en.subtitle.toUpperCase()}</h2>
      {renderFeatureCards()}
    </div>
  );
}
