"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "src/styles/header.module.css";
import { ThemeToggler } from "../utils/ThemeContext";
import Wallet from "./Wallet";
import { useWeb3 } from "../utils/Web3ModalContext";
import { HEADER_CONFIG } from "../config/header";
import { isValidRoute } from "../config/routes";

const Header: React.FC = () => {
  const { isConnected } = useWeb3();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (!isValidRoute(path)) return false;
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path) && 
           (pathname === path || pathname.charAt(path.length) === "/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/logo.svg"
            alt={HEADER_CONFIG.logo.alt}
            width={HEADER_CONFIG.logo.width}
            height={HEADER_CONFIG.logo.height}
            priority
            className={styles.logoImage}
          />
          <div className={styles.headerTitleContainer}>
            <h1 className={styles.headerTitle}>{HEADER_CONFIG.title}</h1>
          </div>
        </Link>
        <nav className={styles.headerNav}>
          {HEADER_CONFIG.navItems.map(({ path, label }) => (
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
              href={HEADER_CONFIG.dashboard.path}
              className={`${styles.navLink} ${isActive(HEADER_CONFIG.dashboard.path) ? styles.active : ""}`}
            >
              {HEADER_CONFIG.dashboard.label}
            </Link>
          )}
        </nav>
        <div className={styles.headerRight}>
          <Wallet />
          <ThemeToggler />
        </div>
      </div>
    </header>
  );
};

export default Header;
