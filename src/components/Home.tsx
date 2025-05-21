"use client";

import React from "react";
import "../styles/home.css";
import strings from "../i18n/home.json";
import { useWeb3 } from "../utils/web3ModalContext";
import Link from "next/link";
import { ROUTES } from "../config/routes";

interface FeatureCardProps {
  number: string;
  title: string;
  description: React.ReactNode;
  isConnected: boolean;
  ensName?: string | null;
  address?: string;
}

const FeatureCard = ({
  number,
  title,
  description,
  isConnected,
  ensName,
  address,
}: FeatureCardProps) => {
  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const [displayTitle, setDisplayTitle] = React.useState(title);
  const [displayDescription, setDisplayDescription] =
    React.useState(description);

  React.useEffect(() => {
    if (isConnected && number === strings.en.numbers.one) {
      setDisplayTitle(
        strings.en.features.one.signedIn.replace(
          "{ensName}",
          ensName || (address ? formatAddress(address) : ""),
        ),
      );
    } else {
      setDisplayTitle(title);
    }
    setDisplayDescription(description);
  }, [isConnected, number, ensName, address, title, description]);

  return (
    <div className="landing-feature-card">
      <div className="landing-feature-number">{number}</div>
      <h3 className="landing-feature-title">{displayTitle}</h3>
      <p className="landing-feature-description">{displayDescription}</p>
    </div>
  );
};

export default function Home() {
  const { ensName, address, isConnected, connect } = useWeb3();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getDescription = (cardNumber: string) => {
    if (!mounted) {
      // Return a simpler version for server-side rendering
      return cardNumber === strings.en.numbers.one ? (
        <span>{strings.en.features.one.connectWallet}</span>
      ) : cardNumber === strings.en.numbers.two ? (
        <span>{strings.en.links.logia.prefix} {strings.en.links.logia.link}</span>
      ) : (
        <span>{strings.en.links.predict}</span>
      );
    }

    if (cardNumber === strings.en.numbers.one) {
      return isConnected ? (
        <span>
          {strings.en.hello.connectedAs.prefix}{" "}
          <Link href={ROUTES.INFO}>{strings.en.hello.connectedAs.link}</Link>{" "}
          {strings.en.hello.connectedAs.suffix}
        </span>
      ) : (
        <span>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              connect();
            }}
          >
            {strings.en.features.one.connectWallet}
          </Link>{" "}
          {strings.en.features.one.startAvatar}
        </span>
      );
    }

    if (cardNumber === strings.en.numbers.two) {
      return (
        <>
          {strings.en.links.logia.prefix}{" "}
          <Link href={ROUTES.LOGIA}>{strings.en.links.logia.link}</Link>
          {isConnected ? (
            <>
              {strings.en.text.and}
              <Link href={ROUTES.DASHBOARD}>
                {strings.en.links.dashboard.link}
              </Link>{" "}
              {strings.en.text.profileAndPriorities}
            </>
          ) : (
            ` and ${strings.en.text.startMakingSmarterChoices}`
          )}
        </>
      );
    }

    return (
      <>
        {strings.en.text.leverage}{" "}
        <Link href={ROUTES.PREDICT}>{strings.en.links.predict}</Link>{" "}
        {strings.en.text.intelFromOracle}
      </>
    );
  };

  return (
    <div className="landing-container">
      <h1 className="landing-title">{strings.en.title.toUpperCase()}</h1>
      <h2 className="landing-subtitle">{strings.en.subtitle.toUpperCase()}</h2>
      <div className="landing-feature-grid">
        <FeatureCard
          number={strings.en.numbers.one}
          title={strings.en.features.one.title.toLowerCase()}
          description={getDescription(strings.en.numbers.one)}
          isConnected={isConnected}
          ensName={ensName}
          address={address}
        />
        <FeatureCard
          number={strings.en.numbers.two}
          title={strings.en.features.two.title.toLowerCase()}
          description={getDescription(strings.en.numbers.two)}
          isConnected={isConnected}
        />
        <FeatureCard
          number={strings.en.numbers.three}
          title={strings.en.features.three.title.toLowerCase()}
          description={getDescription(strings.en.numbers.three)}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
