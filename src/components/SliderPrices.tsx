"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import "../styles/slider_prices.css";
import pricesData from "../i18n/slider_prices.json";
import {
  PRICE_SLIDER_CONFIG,
  CRYPTO_SYMBOL_MAP,
} from "../config/slider_prices";

interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
}

interface CachedData {
  prices: CryptoPrice[];
  timestamp: number;
}

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

const formatPrice = (price: number): string => {
  const isSmallPrice = price < 1;
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: PRICE_SLIDER_CONFIG.PRICE_FORMAT.MIN_FRACTION_DIGITS,
    maximumFractionDigits: isSmallPrice
      ? PRICE_SLIDER_CONFIG.PRICE_FORMAT.MAX_FRACTION_DIGITS.SMALL
      : PRICE_SLIDER_CONFIG.PRICE_FORMAT.MAX_FRACTION_DIGITS.LARGE,
  })}`;
};

const formatChange = (change: number): string => {
  return `${change >= 0 ? pricesData.en.change.up : pricesData.en.change.down} ${Math.abs(change).toFixed(2)}%`;
};

const getCachedPrices = (): CryptoPrice[] | null => {
  try {
    const cached = localStorage.getItem(PRICE_SLIDER_CONFIG.CACHE.KEY);
    if (!cached) return null;

    const { prices, timestamp }: CachedData = JSON.parse(cached);
    if (Date.now() - timestamp > PRICE_SLIDER_CONFIG.CACHE.DURATION) {
      localStorage.removeItem(PRICE_SLIDER_CONFIG.CACHE.KEY);
      return null;
    }

    return prices;
  } catch {
    return null;
  }
};

const setCachedPrices = (prices: CryptoPrice[]) => {
  try {
    const cacheData: CachedData = {
      prices,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      PRICE_SLIDER_CONFIG.CACHE.KEY,
      JSON.stringify(cacheData),
    );
  } catch (error) {
    console.error("Failed to cache prices:", error);
  }
};

const getSymbolFromId = (id: string): string => {
  return CRYPTO_SYMBOL_MAP[id] || id.toUpperCase();
};

const renderItem = (crypto: CryptoPrice | null, index: number) => {
  const isPositive = crypto?.change !== undefined && crypto.change >= 0;
  const symbol = crypto
    ? getSymbolFromId(crypto.symbol.toLowerCase())
    : pricesData.en.placeholders.symbol;
  const price = crypto
    ? formatPrice(crypto.price)
    : pricesData.en.placeholders.price;
  const change = crypto
    ? formatChange(crypto.change)
    : pricesData.en.placeholders.change;

  return (
    <div
      className={`price-item ${crypto ? (isPositive ? "positive" : "negative") : "loading"}`}
      key={`${crypto ? `${crypto.symbol}-` : "loading-"}${index}`}
    >
      <span className="symbol">{symbol}</span>
      <span className="price">{price}</span>
      <span className="price-change">{change}</span>
    </div>
  );
};

class PriceSliderErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Price slider error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="slider-container">
          <div className="price-items-container error">
            <div className="price-item error">
              <span className="symbol">⚠️</span>
              <span className="price">{pricesData.en.errors.fetchFailed}</span>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const SliderPrices: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>(
    () => getCachedPrices() || [],
  );
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollSpeed = 1; // pixels per frame

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (containerRef.current) {
        const container = containerRef.current;
        const firstItem = container.firstElementChild as HTMLElement;

        if (firstItem) {
          const itemWidth = firstItem.offsetWidth + 20; // width + gap
          setScrollPosition((prev) => {
            const newPosition = prev + (scrollSpeed * elapsed) / 16;
            if (newPosition >= itemWidth) {
              // Instead of moving DOM nodes, we'll reset the position
              // and let the duplicated items handle the continuous effect
              return 0;
            }
            return newPosition;
          });
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const symbols = PRICE_SLIDER_CONFIG.API.CRYPTO_IDS.map(
      (id) =>
        `${id.toLowerCase()}${PRICE_SLIDER_CONFIG.WEBSOCKET.STREAM_PREFIX}`,
    ).join("/");

    wsRef.current = new WebSocket(
      `${PRICE_SLIDER_CONFIG.WEBSOCKET.BASE_URL}?streams=${symbols}`,
    );

    wsRef.current.onmessage = (event) => {
      try {
        const { data } = JSON.parse(event.data);
        if (data.e === "ticker") {
          setPrices((prevPrices) => {
            const newPrices = prevPrices.map((price) => {
              if (price.symbol.toLowerCase() === data.s.replace("USDT", "")) {
                return {
                  ...price,
                  price: parseFloat(data.c),
                  change: parseFloat(data.P),
                };
              }
              return price;
            });
            setCachedPrices(newPrices);
            return newPrices;
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      setTimeout(connectWebSocket, 5000);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const fetchPrices = useCallback(
    async (isRetry = false) => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          ids: PRICE_SLIDER_CONFIG.API.CRYPTO_IDS.join(","),
          vs_currencies: "usd",
          include_24hr_change: "true",
        });
        const response = await fetch(
          `${PRICE_SLIDER_CONFIG.API.URL}?${queryParams}`,
        );

        if (!response.ok) {
          throw new Error(
            pricesData.en.errors.httpError.replace(
              "{status}",
              response.status.toString(),
            ),
          );
        }

        const data: CoinGeckoPrice = await response.json();
        const formattedPrices = Object.entries(data)
          .filter(([, price]) => price.usd > 0)
          .map(([id, price]) => ({
            symbol: id.toUpperCase(),
            price: price.usd,
            change: price.usd_24h_change,
          }));

        if (formattedPrices.length === 0) {
          throw new Error(pricesData.en.errors.noValidPrices);
        }

        setPrices(formattedPrices);
        setCachedPrices(formattedPrices);
        if (isRetry) {
          setRetryCount(0);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(pricesData.en.errors.consoleError, error);

        if (retryCount < PRICE_SLIDER_CONFIG.MAX_RETRIES) {
          const delay = Math.min(
            PRICE_SLIDER_CONFIG.RETRY_DELAY.BASE * Math.pow(2, retryCount),
            PRICE_SLIDER_CONFIG.RETRY_DELAY.MAX,
          );
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchPrices(true);
          }, delay);
        }
      }
    },
    [retryCount],
  );

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(
      fetchPrices,
      PRICE_SLIDER_CONFIG.REFRESH_INTERVAL,
    );
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const validPrices = useMemo(
    () => prices.filter((price) => price.price > 0),
    [prices],
  );

  const duplicatedPrices = useMemo(
    () =>
      Array(PRICE_SLIDER_CONFIG.DUPLICATION_FACTOR * 3) // Increased duplication for smoother transition
        .fill(validPrices)
        .flat(),
    [validPrices],
  );

  const displayPrices = useMemo(() => {
    if (isLoading) {
      return Array(PRICE_SLIDER_CONFIG.DUPLICATION_FACTOR * 3).fill(null);
    }
    return duplicatedPrices;
  }, [isLoading, duplicatedPrices]);

  return (
    <PriceSliderErrorBoundary>
      <div className="slider-container">
        <div
          ref={containerRef}
          className="price-items-container"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {displayPrices.map((price, index) => renderItem(price, index))}
        </div>
      </div>
    </PriceSliderErrorBoundary>
  );
};
