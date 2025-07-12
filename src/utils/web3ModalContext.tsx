"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ethers } from "ethers";
import { WALLET_CONFIG } from "../config/wallet";
import { COINGECKO_CONFIG } from "../config/coingecko";
import strings from "../i18n/home.json";
import walletStrings from "../i18n/wallet.json";

const queryClient = new QueryClient();
const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
});

interface PortfolioItem {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change24h: number;
}

interface Web3ContextType {
  address: string | undefined;
  account: string | null;
  ensName: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  portfolio: PortfolioItem[];
  totalPortfolioValue: number;
  portfolioChange24h: number;
}

// Create the context
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Inner provider component that uses wagmi hooks
const Web3ProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [portfolio, setPortfolio] = useState<Web3ContextType["portfolio"]>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [portfolioChange24h, setPortfolioChange24h] = useState(0);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const ensCache = useRef<Map<string, string | null>>(new Map());

  // Initialize provider once
  useEffect(() => {
    if (window.ethereum) {
      // Handle multiple providers
      if (
        Array.isArray(window.ethereum.providers) &&
        window.ethereum.providers.length > 1
      ) {
        window.ethereum = window.ethereum.providers[0];
      }
      setProvider(
        new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider),
      );
    }
  }, []);

  // Add ENS resolution function with caching and retries
  const resolveEnsName = useCallback(
    async (address: string) => {
      try {
        // Check cache first
        const cachedName = ensCache.current.get(address);
        if (cachedName !== undefined) {
          setEnsName(cachedName);
          return;
        }

        if (!provider) {
          throw new Error(WALLET_CONFIG.ERRORS.NO_PROVIDER);
        }

        // Try to resolve ENS name with retries
        let retries = 3;
        let lastError: Error | null = null;

        while (retries > 0) {
          try {
            const name = await provider.lookupAddress(address);
            ensCache.current.set(address, name);
            setEnsName(name);
            return;
          } catch (error) {
            lastError = error as Error;
            retries--;
            if (retries > 0) {
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (3 - retries)),
              );
            }
          }
        }

        // If all retries failed, cache the null result
        ensCache.current.set(address, null);
        setEnsName(null);
        console.error(walletStrings.en.errors.ens.afterRetries, lastError);
      } catch (error) {
        console.error(walletStrings.en.errors.ens.resolution, error);
        setEnsName(null);
      }
    },
    [provider],
  );

  useEffect(() => {
    if (address) {
      resolveEnsName(address);
    } else {
      setEnsName(null);
    }
  }, [address, resolveEnsName]);

  const refreshPortfolio = useCallback(async () => {
    if (!address) return;

    try {
      if (!window.ethereum) {
        throw new Error(walletStrings.en.errors.ens.noProvider);
      }

      // Handle multiple providers
      if (
        Array.isArray(window.ethereum.providers) &&
        window.ethereum.providers.length > 1
      ) {
        window.ethereum = window.ethereum.providers[0];
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider,
      );

      // Get ETH balance
      const balance = await provider.getBalance(address);
      const ethPrice = await fetch(
        COINGECKO_CONFIG.SIMPLE_PRICE_URL("ethereum"),
      )
        .then((res) => res.json())
        .then((data) => ({
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change,
        }));

      const ethValue = Number(ethers.formatEther(balance)) * ethPrice.price;

      // Common ERC-20 tokens to check
      const commonTokens = WALLET_CONFIG.TOKENS.COMMON;

      // ERC-20 ABI for balanceOf
      const erc20Abi = WALLET_CONFIG.TOKENS.ERC20_ABI;

      const tokenBalances = await Promise.all(
        commonTokens.map(async (token) => {
          try {
            const contract = new ethers.Contract(
              token.address,
              erc20Abi,
              provider,
            );
            const balance = await contract.balanceOf(address);
            const decimals = await contract.decimals();
            const tokenPrice = await fetch(
              COINGECKO_CONFIG.SIMPLE_PRICE_URL(token.symbol.toLowerCase()),
            )
              .then((res) => res.json())
              .then((data) => ({
                price: data[token.symbol.toLowerCase()]?.usd || 0,
                change24h:
                  data[token.symbol.toLowerCase()]?.usd_24h_change || 0,
              }));

            const formattedBalance = Number(
              ethers.formatUnits(balance, decimals),
            );
            const value = formattedBalance * tokenPrice.price;

            return {
              symbol: token.symbol,
              name: token.name,
              balance: formattedBalance,
              value: value,
              change24h: tokenPrice.change24h,
            };
          } catch (error) {
            console.error(
              walletStrings.en.errors.token.balance.replace(
                "{symbol}",
                token.symbol,
              ),
              error,
            );
            return null;
          }
        }),
      );

      // Filter out null results
      const validTokenBalances = tokenBalances.filter(
        (token): token is NonNullable<typeof token> => token !== null,
      );

      // Filter out assets with zero balance
      const nonZeroBalances = validTokenBalances.filter(
        (token) => token.balance > 0,
      );

      // Add ETH to the portfolio if balance is non-zero
      if (ethValue > 0) {
        nonZeroBalances.push({
          symbol: "ETH",
          name: "Ethereum",
          balance: Number(ethers.formatEther(balance)),
          value: ethValue,
          change24h: ethPrice.change24h,
        });
      }

      // Calculate total portfolio value and weighted change
      const totalValue = nonZeroBalances.reduce(
        (sum, asset) => sum + asset.value,
        0,
      );
      const weightedChange = nonZeroBalances.reduce(
        (sum, asset) => sum + (asset.value / totalValue) * asset.change24h,
        0,
      );

      setPortfolio(nonZeroBalances);
      setTotalPortfolioValue(totalValue);
      setPortfolioChange24h(weightedChange);
    } catch (error) {
      console.error(walletStrings.en.errors.portfolio.refresh, error);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      refreshPortfolio();
      const interval = setInterval(
        refreshPortfolio,
        WALLET_CONFIG.PORTFOLIO.REFRESH_INTERVAL_MS,
      );
      return () => clearInterval(interval);
    }
  }, [isConnected, address, refreshPortfolio]);

  const value = {
    address,
    account: address || null,
    ensName: ensName || strings.en.hello.anonymous,
    isConnected,
    connect: async () => {
      try {
        await connect({ connector: config.connectors[0] });
      } catch (error) {
        console.error(walletStrings.en.errors.connection.failed, error);
        throw error;
      }
    },
    disconnect,
    portfolio,
    totalPortfolioValue,
    portfolioChange24h,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Outer provider component that sets up the providers
export const Web3Provider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <Web3ProviderInner>{children}</Web3ProviderInner>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

// Custom hook to use the Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error(walletStrings.en.errors.web3.context);
  }
  return context;
};
