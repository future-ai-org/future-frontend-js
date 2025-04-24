import React, { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../contexts/Web3ModalContext";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import "../styles/wallet.css";
import strings from "../i18n/wallet.json";
import { WALLET_CONFIG } from "../config/wallet";
import { useConnect } from "wagmi";
import { CreateConnectorFn } from "wagmi";

type WalletProvider = {
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  isRainbow?: boolean;
  providers?: WalletProvider[];
};

interface SolanaRequestParams {
  method: string;
  params: unknown[];
}

interface SolanaProvider {
  connect: () => Promise<{ publicKey: string }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: () => void) => void;
  removeAllListeners: () => void;
  request: (params: SolanaRequestParams) => Promise<unknown>;
}

interface Window {
  ethereum?: WalletProvider;
  phantom?: {
    solana: SolanaProvider;
  };
  solana?: SolanaProvider;
}

interface WalletOption {
  name: string;
  icon: string;
  id: string;
  isAvailable: boolean;
  downloadUrl?: string;
  connector?: CreateConnectorFn;
}

const Wallet: React.FC = () => {
  const { address, disconnect, isConnected, ensName } = useWeb3();
  const { connect } = useConnect();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const checkWallets = useCallback(() => {
    const { ethereum } = window;
    if (!ethereum) return;

    // Handle multiple providers
    if (ethereum.providers && ethereum.providers.length > 1) {
      setError(WALLET_CONFIG.ERRORS.MULTIPLE_PROVIDERS);
      window.ethereum = ethereum.providers[0];
      return;
    }

    const isWalletAvailable = (walletName: keyof WalletProvider) =>
      Boolean(
        ethereum[walletName] ||
          ethereum.providers?.some((p: WalletProvider) => p[walletName]),
      );

    const isPhantomAvailable = Boolean(
      window.phantom || (window as Window & { solana?: SolanaProvider }).solana,
    );

    const detectedWallets: WalletOption[] = [];

    // Add wallets based on availability
    if (isWalletAvailable("isMetaMask")) {
      detectedWallets.push({
        name: WALLET_CONFIG.METAMASK.NAME,
        icon: WALLET_CONFIG.METAMASK.ICON,
        id: "injected",
        isAvailable: true,
        downloadUrl: WALLET_CONFIG.METAMASK.DOWNLOAD_URL,
        connector: WALLET_CONFIG.METAMASK.CONNECTOR,
      });
    }

    if (isWalletAvailable("isBraveWallet")) {
      detectedWallets.push({
        name: WALLET_CONFIG.BRAVE.NAME,
        icon: WALLET_CONFIG.BRAVE.ICON,
        id: "brave",
        isAvailable: true,
        downloadUrl: WALLET_CONFIG.BRAVE.DOWNLOAD_URL,
        connector: WALLET_CONFIG.BRAVE.CONNECTOR,
      });
    }

    if (isPhantomAvailable) {
      detectedWallets.push({
        name: WALLET_CONFIG.PHANTOM.NAME,
        icon: WALLET_CONFIG.PHANTOM.ICON,
        id: "phantom",
        isAvailable: true,
        downloadUrl: WALLET_CONFIG.PHANTOM.DOWNLOAD_URL,
      });
    }

    if (isWalletAvailable("isRainbow")) {
      detectedWallets.push({
        name: WALLET_CONFIG.RAINBOW.NAME,
        icon: WALLET_CONFIG.RAINBOW.ICON,
        id: "rainbow",
        isAvailable: true,
        downloadUrl: WALLET_CONFIG.RAINBOW.DOWNLOAD_URL,
        connector: WALLET_CONFIG.RAINBOW.CONNECTOR,
      });
    }

    setAvailableWallets(detectedWallets);
  }, []);

  useEffect(() => {
    checkWallets();
    window.addEventListener("ethereum#initialized", checkWallets, {
      once: true,
    });
    return () =>
      window.removeEventListener("ethereum#initialized", checkWallets);
  }, [checkWallets]);

  const formatAddress = useCallback((address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, WALLET_CONFIG.ADDRESS.PREFIX_LENGTH)}...${address.slice(-WALLET_CONFIG.ADDRESS.SUFFIX_LENGTH)}`;
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      setError(null);
      await disconnect();
      setSelectedWallet(null);
      router.push("/");
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : strings.en.connectionError,
      );
    }
  }, [disconnect, router]);

  const handleWalletClick = useCallback(
    async (walletId: string) => {
      const wallet = availableWallets.find((w) => w.id === walletId);
      if (!wallet) return;

      if (wallet.downloadUrl && !wallet.isAvailable) {
        window.open(wallet.downloadUrl, "_blank");
        return;
      }

      setSelectedWallet(walletId);
      setIsConnecting(true);
      setError(null);

      try {
        if (walletId === "phantom") {
          if (!window.phantom?.solana) {
            throw new Error(strings.en.phantomNotInstalled);
          }

          const response = await window.phantom.solana.connect();
          if (!response?.publicKey) {
            throw new Error(strings.en.phantomConnectionFailed);
          }
        } else if (wallet.connector) {
          await connect({ connector: wallet.connector });
        } else {
          throw new Error(strings.en.unsupportedWallet);
        }

        setShowModal(false);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : strings.en.connectionError,
        );
      } finally {
        setIsConnecting(false);
      }
    },
    [availableWallets, connect],
  );

  const renderModal = useCallback(() => {
    if (!showModal || !mounted) return null;

    const availableWalletsList = availableWallets.filter(
      (wallet) => wallet.isAvailable,
    );

    return createPortal(
      <div
        className="wallet-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}
      >
        <div className="wallet-modal">
          <div className="wallet-modal-header">
            <h2>{strings.en.connectWallet}</h2>
            <button
              className="close-button"
              onClick={() => setShowModal(false)}
              aria-label={strings.en.close}
            >
              ×
            </button>
          </div>
          {error && <div className="wallet-modal-error">{error}</div>}
          <div className="wallet-list">
            {availableWalletsList.map((wallet) => (
              <button
                key={wallet.id}
                className="wallet-option"
                onClick={() => handleWalletClick(wallet.id)}
                disabled={isConnecting}
                aria-label={`${strings.en.connectWallet} ${wallet.name}`}
              >
                <span className="wallet-icon">{wallet.icon}</span>
                <div className="wallet-info">
                  <span className="wallet-name">{wallet.name}</span>
                </div>
                {isConnecting && selectedWallet === wallet.id && (
                  <div className="wallet-loading">{strings.en.connecting}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body,
    );
  }, [
    showModal,
    error,
    availableWallets,
    isConnecting,
    selectedWallet,
    handleWalletClick,
    mounted,
  ]);

  if (!mounted) return null;

  if (isConnected) {
    return (
      <div className="wallet-button-container">
        <div className="wallet-connected">
          <span className="wallet-address">
            {ensName || formatAddress(address)}
          </span>
          <button
            onClick={handleDisconnect}
            className="disconnect-button"
            aria-label={strings.en.disconnectWallet}
          >
            {strings.en.disconnectWallet}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-button-container">
      <button
        onClick={() => setShowModal(true)}
        className="connect-button"
        disabled={isConnecting}
        aria-label={strings.en.connectWallet}
      >
        {isConnecting ? strings.en.connecting : strings.en.connectWallet}
      </button>
      {renderModal()}
    </div>
  );
};

export default Wallet;
