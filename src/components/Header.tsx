'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "../styles/header.css";
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
    <header className="header">
      <div className="header-content">
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
          <div className="header-title-container">
            <h1 className="header-title">{strings.en.title}</h1>
          </div>
        </Link>
        <nav className="header-nav">
          <Link
            href="/astrology"
            className={`nav-link ${isActive("/astrology") ? "active" : ""}`}
          >
            {strings.en.nav.astrology}
          </Link>
          <Link
            href="/invest"
            className={`nav-link ${isActive("/invest") ? "active" : ""}`}
          >
            {strings.en.nav.invest}
          </Link>
          <Link
            href="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            {strings.en.nav.about}
          </Link>
          {isConnected && (
            <Link
              href="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              {strings.en.nav.dashboard}
            </Link>
          )}
        </nav>
        <div className="header-right">
          <Wallet />
          <Toggler />
        </div>
      </div>
    </header>
  );
};

export default Header;
