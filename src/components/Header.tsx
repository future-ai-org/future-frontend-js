import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/header.css";
import strings from "../i18n/header.json";
import { Toggler } from "./Toggler";
import Wallet from "./Wallet";
import { useWeb3 } from "../contexts/Web3ModalContext";
import logo from "../assets/logo.svg";

const Header: React.FC = () => {
  const { isConnected } = useWeb3();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "var(--primary-color)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ width: "30px", height: "30px" }}
          />
          <div className="header-title-container">
            <h1 className="header-title">{strings.en.title}</h1>
          </div>
        </Link>
        <nav className="header-nav">
          <Link
            to="/astrology"
            className={`nav-link ${isActive("/astrology") ? "active" : ""}`}
          >
            {strings.en.nav.astrology}
          </Link>
          <Link
            to="/invest"
            className={`nav-link ${isActive("/invest") ? "active" : ""}`}
          >
            {strings.en.nav.invest}
          </Link>
          <Link
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            {strings.en.nav.about}
          </Link>
          {isConnected && (
            <Link
              to="/"
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
