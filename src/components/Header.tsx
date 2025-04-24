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

const Header: React.FC = () => {
  const { isConnected } = useWeb3();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "var(--primary-color)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Image
            src={logo}
            alt="LILIT Logo"
            width={30}
            height={30}
            priority
            style={{ width: "30px", height: "30px" }}
          />
          <div className={styles.headerTitleContainer}>
            <h1 className={styles.headerTitle}>{strings.en.title}</h1>
          </div>
        </Link>
        <nav className={styles.headerNav}>
          <Link
            href="/about"
            className={`${styles.navLink} ${isActive("/about") ? styles.active : ""}`}
          >
            {strings.en.nav.about}
          </Link>
          <Link
            href="/logia"
            className={`${styles.navLink} ${isActive("/logia") ? styles.active : ""}`}
          >
            {strings.en.nav.logia}
          </Link>
          <Link
            href="/trade"
            className={`${styles.navLink} ${isActive("/trade") ? styles.active : ""}`}
          >
            {strings.en.nav.trade}
          </Link>
          <Link
            href="/predict"
            className={`${styles.navLink} ${isActive("/predict") ? styles.active : ""}`}
          >
            {strings.en.nav.predict}
          </Link>
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
