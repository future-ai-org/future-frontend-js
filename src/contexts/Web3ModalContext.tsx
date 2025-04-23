import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ethers } from "ethers";
import { WALLET_CONFIG } from "../config/wallet";

// Create query client
const queryClient = new QueryClient();

// Create wagmi config
const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
});

// Define the context type
interface Web3ContextType {
  address: string | undefined;
  account: string | null;
  ensName: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  portfolio: Array<{
    symbol: string;
    name: string;
    balance: number;
    value: number;
    change24h: number;
  }>;
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

  // Add ENS resolution function
  const resolveEnsName = useCallback(async (address: string) => {
    try {
      if (!window.ethereum) {
        throw new Error(WALLET_CONFIG.ERRORS.NO_PROVIDER);
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider,
      );
      const name = await provider.lookupAddress(address);
      setEnsName(name);
    } catch (error) {
      console.error("Error resolving ENS name:", error);
      setEnsName(null);
    }
  }, []);

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
        throw new Error(WALLET_CONFIG.ERRORS.NO_PROVIDER);
      }

      // Handle multiple providers
      if (window.ethereum?.providers?.length > 1) {
        window.ethereum = window.ethereum.providers[0];
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider,
      );

      // Get ETH balance
      const balance = await provider.getBalance(address);
      const ethPrice = await fetch(
        `${WALLET_CONFIG.COINGECKO.API_URL}?ids=ethereum&vs_currencies=usd&include_24hr_change=true`,
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
              `${WALLET_CONFIG.COINGECKO.API_URL}?ids=${token.symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`,
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
            console.error(`Error fetching ${token.symbol} balance:`, error);
            return null;
          }
        }),
      );

      // Filter out null results and add ETH
      const validTokenBalances = tokenBalances.filter(
        (token): token is NonNullable<typeof token> => token !== null,
      );

      // Filter out assets with zero balance
      const nonZeroBalances = validTokenBalances.filter(
        (token) => token.balance > 0,
      );

      const allAssets = [
        {
          symbol: "ETH",
          name: "Ethereum",
          balance: Number(ethers.formatEther(balance)),
          value: ethValue,
          change24h: ethPrice.change24h,
        },
        ...nonZeroBalances,
      ].filter((asset) => parseFloat(asset.balance.toString()) > 0);

      const totalValue = allAssets.reduce((sum, asset) => sum + asset.value, 0);
      const weightedChange = allAssets.reduce(
        (sum, asset) => sum + (asset.value / totalValue) * asset.change24h,
        0,
      );

      setPortfolio(allAssets);
      setTotalPortfolioValue(totalValue);
      setPortfolioChange24h(weightedChange);
    } catch (error) {
      console.error("Error refreshing portfolio:", error);
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
    ensName,
    isConnected,
    connect: async () => {
      try {
        await connect({ connector: config.connectors[0] });
      } catch (error) {
        console.error("Connection error:", error);
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
    throw new Error(WALLET_CONFIG.ERRORS.WEB3_CONTEXT);
  }
  return context;
};
