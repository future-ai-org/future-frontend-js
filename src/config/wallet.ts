import { injected } from "wagmi/connectors";
import { COINGECKO_CONFIG } from "./crypto";

export const WALLET_CONFIG = {
  METAMASK: {
    NAME: "MetaMask",
    ICON: "🦊",
    DOWNLOAD_URL: "https://metamask.io/download/",
    CONNECTOR: injected(),
  },
  BRAVE: {
    NAME: "Brave Wallet",
    ICON: "🦁",
    DOWNLOAD_URL: "https://brave.com/wallet/",
    CONNECTOR: injected(),
  },
  RAINBOW: {
    NAME: "Rainbow",
    ICON: "🌈",
    DOWNLOAD_URL: "https://rainbow.me/",
    CONNECTOR: injected(),
  },
  PHANTOM: {
    NAME: "Phantom",
    ICON: "👻",
    DOWNLOAD_URL: "https://phantom.app/",
    CONNECTOR: injected(),
  },
  ADDRESS: {
    PREFIX_LENGTH: 6,
    SUFFIX_LENGTH: 4,
  },
  ERRORS: {
    CONNECTION: "failed to connect wallet. please try again.",
    MULTIPLE_PROVIDERS:
      "multiple wallet providers detected. please disable other wallet extensions and try again.",
    WEB3_CONTEXT: "useWeb3 must be used within a Web3Provider",
    NO_PROVIDER: "No Ethereum provider found",
  },
  COINGECKO: {
    API_URL: COINGECKO_CONFIG.SIMPLE_PRICE_URL("ethereum"),
  },
  PORTFOLIO: {
    REFRESH_INTERVAL_MS: 30000,
  },
  TOKENS: {
    COMMON: [
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        symbol: "USDT",
        name: "Tether USD",
      },
      {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        name: "USD Coin",
      },
      {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        name: "Dai Stablecoin",
      },
      {
        address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
      },
    ] as Array<{
      address: string;
      symbol: string;
      name: string;
    }>,
    ERC20_ABI: [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
    ],
  },
} as const;
