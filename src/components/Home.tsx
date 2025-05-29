"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../styles/home.css";
import strings from "../i18n/home.json";
import { useWeb3 } from "../utils/web3ModalContext";
import Link from "next/link";
import { ROUTES } from "../config/routes";
import DecorativeStars from "../utils/decorativeStars";

type CardNumber = "1" | "2" | "3";

interface FeatureCardProps {
  number: CardNumber;
  title: string;
  description: React.ReactNode;
  isConnected: boolean;
  ensName?: string | null;
  address?: string;
}

const FeatureCard = React.memo(
  ({
    number,
    title,
    description,
    isConnected,
    ensName,
    address,
  }: FeatureCardProps) => {
    const formatAddress = useCallback(
      (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      [],
    );
    const [displayTitle, setDisplayTitle] = useState(title);

    useEffect(() => {
      if (isConnected && number === strings.en.numbers.one) {
        const name = ensName || (address ? formatAddress(address) : "");
        setDisplayTitle(
          strings.en.features.one.signedIn.replace(
            "{ensName}",
            `<span class="ens-name">${name}</span>`,
          ),
        );
      } else {
        setDisplayTitle(title);
      }
    }, [isConnected, number, ensName, address, title, formatAddress]);

    return (
      <div className="landing-feature-card">
        <div className="landing-feature-number">{number}</div>
        <h3
          className="landing-feature-title"
          dangerouslySetInnerHTML={{ __html: displayTitle }}
        />
        <p className="landing-feature-description">{description}</p>
      </div>
    );
  },
);

FeatureCard.displayName = "FeatureCard";

export default function Home() {
  const { ensName, address, isConnected, connect } = useWeb3();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getDescription = useCallback(
    (cardNumber: CardNumber) => {
      if (!isClient) {
        return cardNumber === strings.en.numbers.one ? (
          <span>{strings.en.features.one.connectWallet}</span>
        ) : cardNumber === strings.en.numbers.two ? (
          <span>
            {strings.en.links.logia.prefix} {strings.en.links.logia.link}
          </span>
        ) : (
          <span>
            {strings.en.links.predict.prefix} {strings.en.links.predict.link}{" "}
            {strings.en.links.predict.suffix}
          </span>
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
                {strings.en.text.forYourGoals}
              </>
            ) : (
              <>
                {strings.en.text.and}
                <Link href={ROUTES.PROFILE}>your profile</Link>
                {strings.en.text.forYourGoals}
              </>
            )}
          </>
        );
      }

      return (
        <>
          <Link href={ROUTES.TRADE}>{strings.en.links.predict.link}</Link>
          {strings.en.links.predict.suffix}
          <Link href={ROUTES.PREDICT}>
            {strings.en.links.predict.secondLink}
          </Link>
          {strings.en.links.predict.finalSuffix}
        </>
      );
    },
    [isClient, isConnected, connect],
  );

  const featureCards = useMemo(
    () => [
      {
        number: strings.en.numbers.one as CardNumber,
        title: strings.en.features.one.title.toLowerCase(),
        description: getDescription(strings.en.numbers.one as CardNumber),
        isConnected,
        ensName,
        address,
      },
      {
        number: strings.en.numbers.two as CardNumber,
        title: strings.en.features.two.title.toLowerCase(),
        description: getDescription(strings.en.numbers.two as CardNumber),
        isConnected,
      },
      {
        number: strings.en.numbers.three as CardNumber,
        title: strings.en.features.three.title.toLowerCase(),
        description: getDescription(strings.en.numbers.three as CardNumber),
        isConnected,
      },
    ],
    [getDescription, isConnected, ensName, address],
  );

  return (
    <div className="landing-container">
      <DecorativeStars />
      <h1 className="landing-title">{strings.en.title.toUpperCase()}</h1>
      <h2 className="landing-subtitle">{strings.en.subtitle.toUpperCase()}</h2>
      <div className="landing-feature-grid">
        {featureCards.map((card) => (
          <FeatureCard key={card.number} {...card} />
        ))}
      </div>
    </div>
  );
}
