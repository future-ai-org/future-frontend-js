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

  return (
    <div className="landing-feature-card">
      <div className="landing-feature-number">{number}</div>
      <h3 className="landing-feature-title">
        {isConnected && number === "I"
          ? strings.en.features.one.signedIn.replace(
              "{ensName}",
              ensName || formatAddress(address),
            )
          : title}
      </h3>
      <p className="landing-feature-description">{description}</p>
    </div>
  );
};

export default function Home() {
  const { ensName, address, isConnected, connect } = useWeb3();

  const renderFeatureCards = () => (
    <div className="landing-feature-grid">
      <FeatureCard
        number="I"
        title={strings.en.features.one.title.toLowerCase()}
        description={
          isConnected ? (
            <span>
              {strings.en.hello.connectedAs.split("reading the about")[0]}
              <Link href="/about">reading the about</Link>
              {strings.en.hello.connectedAs.split("reading the about")[1]}
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
        number="II"
        title={strings.en.features.two.title.toLowerCase()}
        description={
          <>
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
          </>
        }
        isConnected={isConnected}
      />
      <FeatureCard
        number="III"
        title={strings.en.features.three.title.toLowerCase()}
        description={
          <>
            leverage smart <Link href="/predict">predictive</Link> intel from
            our oracle agents
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
