"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "src/styles/header.module.css";
import strings from "../i18n/header.json";
import { Toggler } from "./Toggler";
import Wallet from "./Wallet";
import { useWeb3 } from "../contexts/Web3ModalContext";
import logo from "../assets/logo.svg";

const NAV_ITEMS = [
  { path: "/info", label: strings.en.nav.info },
  { path: "/logia", label: strings.en.nav.logia },
  { path: "/trade", label: strings.en.nav.trade },
  { path: "/predict", label: strings.en.nav.predict },
];

const Header: React.FC = () => {
  const { isConnected } = useWeb3();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || (path !== "/" && pathname?.startsWith(path));

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src={logo}
            alt="LILIT Logo"
            width={30}
            height={30}
            priority
            className={styles.logoImage}
          />
          <div className={styles.headerTitleContainer}>
            <h1 className={styles.headerTitle}>{strings.en.title}</h1>
          </div>
        </Link>
        <nav className={styles.headerNav}>
          {NAV_ITEMS.map(({ path, label }) => (
            <Link
              key={path}
              href={path}
              className={`${styles.navLink} ${isActive(path) ? styles.active : ""}`}
            >
              {label}
            </Link>
          ))}
          {isConnected && (
            <Link
              href="/dashboard"
              className={`${styles.navLink} ${isActive("/dashboard") ? styles.active : ""}`}
            >
              {strings.en.nav.dashboard}
            </Link>
          )}
        </nav>
        <div className={styles.headerRight}>
          <Wallet />
          <Toggler />
        </div>
      </div>
    </header>
  );
};

export default Header;
