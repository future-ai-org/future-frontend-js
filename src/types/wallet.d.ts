declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

interface EthereumProvider {
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  isRainbow?: boolean;
  providers?: EthereumProvider[];
  request: (params: { method: string; params: unknown[] }) => Promise<unknown>;
}

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
  ethereum?: EthereumProvider;
  phantom?: {
    solana: SolanaProvider;
  };
}
