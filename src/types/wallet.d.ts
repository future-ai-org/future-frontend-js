declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

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
}
