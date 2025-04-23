import React, { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../contexts/Web3ModalContext";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import "../styles/wallet.css";
import strings from "../i18n/wallet.json";
import { WALLET_CONFIG } from "../config/wallet";
import { useConnect } from "wagmi";

declare global {
  interface Window {
    ethereum?: any;
    phantom?: {
      solana: {
        connect: () => Promise<any>;
        disconnect: () => Promise<void>;
        on: (event: string, callback: () => void) => void;
        removeAllListeners: () => void;
        request: (params: { method: string; params: any[] }) => Promise<any>;
      };
    };
    solana?: any;
  }
}

interface WalletOption {
  name: string;
  icon: string;
  description: string;
  id: string;
  isAvailable: boolean;
  downloadUrl?: string;
  connector?: any;
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

  const checkWallets = useCallback(() => {
    const isMetaMaskAvailable = Boolean(
      typeof window.ethereum !== "undefined" &&
        (window.ethereum.isMetaMask ||
          window.ethereum.providers?.some(
            (p: { isMetaMask: boolean }) => p.isMetaMask,
          )),
    );

    const isBraveAvailable = Boolean(
      typeof window.ethereum !== "undefined" &&
        (window.ethereum.isBraveWallet ||
          window.ethereum.providers?.some(
            (p: { isBraveWallet: boolean }) => p.isBraveWallet,
          )),
    );

    const isPhantomAvailable = Boolean(
      typeof window.phantom !== "undefined" ||
        typeof window.solana !== "undefined",
    );

    // Handle multiple providers
    if (window.ethereum?.providers?.length > 1) {
      setError(WALLET_CONFIG.ERRORS.MULTIPLE_PROVIDERS);
      window.ethereum = window.ethereum.providers[0];
    }

    setAvailableWallets([
      {
        name: WALLET_CONFIG.METAMASK.NAME,
        icon: WALLET_CONFIG.METAMASK.ICON,
        description: strings.en.metamaskDescription,
        id: "injected",
        isAvailable: isMetaMaskAvailable,
        downloadUrl: WALLET_CONFIG.METAMASK.DOWNLOAD_URL,
        connector: WALLET_CONFIG.METAMASK.CONNECTOR,
      },
      {
        name: WALLET_CONFIG.WALLETCONNECT.NAME,
        icon: WALLET_CONFIG.WALLETCONNECT.ICON,
        description: strings.en.walletConnectDescription,
        id: "walletConnect",
        isAvailable: true,
        connector: WALLET_CONFIG.WALLETCONNECT.CONNECTOR,
      },
      {
        name: WALLET_CONFIG.COINBASE.NAME,
        icon: WALLET_CONFIG.COINBASE.ICON,
        description: strings.en.coinbaseDescription,
        id: "coinbase",
        isAvailable: true,
        downloadUrl: WALLET_CONFIG.COINBASE.DOWNLOAD_URL,
        connector: WALLET_CONFIG.COINBASE.CONNECTOR,
      },
      {
        name: WALLET_CONFIG.TRUST.NAME,
        icon: WALLET_CONFIG.TRUST.ICON,
        description: strings.en.trustDescription,
        id: "trust",
        isAvailable: true,
        downloadUrl: WALLET_CONFIG.TRUST.DOWNLOAD_URL,
        connector: WALLET_CONFIG.TRUST.CONNECTOR,
      },
      {
        name: WALLET_CONFIG.BRAVE.NAME,
        icon: WALLET_CONFIG.BRAVE.ICON,
        description: strings.en.braveDescription,
        id: "brave",
        isAvailable: isBraveAvailable,
        downloadUrl: WALLET_CONFIG.BRAVE.DOWNLOAD_URL,
        connector: WALLET_CONFIG.BRAVE.CONNECTOR,
      },
      {
        name: WALLET_CONFIG.RAINBOW.NAME,
        icon: WALLET_CONFIG.RAINBOW.ICON,
        description: strings.en.rainbowDescription,
        id: "rainbow",
        isAvailable: true,
        downloadUrl: WALLET_CONFIG.RAINBOW.DOWNLOAD_URL,
        connector: WALLET_CONFIG.RAINBOW.CONNECTOR,
      },
      {
        name: WALLET_CONFIG.PHANTOM.NAME,
        icon: WALLET_CONFIG.PHANTOM.ICON,
        description: strings.en.phantomDescription,
        id: "phantom",
        isAvailable: isPhantomAvailable,
        downloadUrl: WALLET_CONFIG.PHANTOM.DOWNLOAD_URL,
      },
    ]);
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

  const handleDisconnect = useCallback(() => {
    disconnect();
    router.push("/");
  }, [disconnect, router]);

  const handleConnect = useCallback(async () => {
    if (!selectedWallet) return;

    try {
      setError(null);
      setIsConnecting(true);

      const wallet = availableWallets.find((w) => w.id === selectedWallet);
      if (!wallet) throw new Error("Wallet not found");

      if (selectedWallet === "phantom") {
        if (window.phantom?.solana) {
          await window.phantom.solana.connect();
        }
      } else if (wallet.connector) {
        await connect({ connector: wallet.connector });
      } else {
        throw new Error("Unsupported wallet");
      }

      setShowModal(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : strings.en.connectionError,
      );
    } finally {
      setIsConnecting(false);
    }
  }, [connect, selectedWallet, availableWallets]);

  const handleWalletClick = useCallback(
    (walletId: string) => {
      const wallet = availableWallets.find((w) => w.id === walletId);
      if (wallet?.downloadUrl && !wallet.isAvailable) {
        window.open(wallet.downloadUrl, "_blank");
        return;
      }
      setSelectedWallet(walletId);
      handleConnect();
    },
    [availableWallets, handleConnect],
  );

  const renderModal = useCallback(() => {
    if (!showModal) return null;

    return createPortal(
      <div className="wallet-modal-overlay" onClick={() => setShowModal(false)}>
        <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
          <div className="wallet-modal-header">
            <h2>{strings.en.connectWallet}</h2>
            <button
              className="close-button"
              onClick={() => setShowModal(false)}
            >
              {strings.en.closeButton}
            </button>
          </div>
          {error && <div className="wallet-modal-error">{error}</div>}
          <div className="wallet-list">
            {availableWallets.map((wallet) => (
              <button
                key={wallet.id}
                className={`wallet-option ${!wallet.isAvailable ? "disabled" : ""}`}
                onClick={() => handleWalletClick(wallet.id)}
                disabled={!wallet.isAvailable || isConnecting}
              >
                <span className="wallet-icon">{wallet.icon}</span>
                <div className="wallet-info">
                  <span className="wallet-name">{wallet.name}</span>
                  <span className="wallet-description">
                    {wallet.description}
                  </span>
                </div>
                {isConnecting && selectedWallet === wallet.id && (
                  <div className="wallet-loading">{strings.en.connecting}</div>
                )}
                {!wallet.isAvailable && (
                  <div className="wallet-unavailable">
                    <a
                      href={wallet.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {strings.en.download}
                    </a>
                  </div>
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
  ]);

  if (isConnected) {
    return (
      <div className="wallet-button-container">
        <div className="wallet-connected">
          <span className="wallet-address">
            {ensName || formatAddress(address)}
          </span>
          <button onClick={handleDisconnect} className="disconnect-button">
            {strings.en.disconnect}
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
      >
        {isConnecting ? strings.en.connecting : strings.en.connectWalletButton}
      </button>
      {renderModal()}
    </div>
  );
};

export default Wallet;
