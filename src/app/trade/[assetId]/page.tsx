"use client";

import { Suspense, useEffect, useState } from "react";
import { TradeAsset } from "../../../components/TradeAsset";
import { useParams } from "next/navigation";
import Loading from "../../../utils/loading";
import "../../../styles/tradeAsset.css";
import { COINGECKO_CONFIG } from "../../../config/crypto";
import { FaStar } from "react-icons/fa";

interface AssetInfo {
  symbol: string;
  name: string;
}

function TradeContent() {
  const params = useParams();
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchAssetInfo = async () => {
      try {
        const response = await fetch(
          `${COINGECKO_CONFIG.BASE_URL}${COINGECKO_CONFIG.ENDPOINTS.COIN_DETAILS.replace("{{id}}", params.assetId as string)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch asset info");
        const data = await response.json();
        setAssetInfo({
          symbol: data.symbol.toUpperCase(),
          name: data.name,
        });
      } catch (err) {
        console.error("Failed to fetch asset info:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssetInfo();
  }, [params.assetId]);

  useEffect(() => {
    const loadFavoriteStatus = () => {
      try {
        const favorites = JSON.parse(
          localStorage.getItem("favoriteAssets") || "[]",
        );
        setIsFavorite(favorites.some((fav: { id: string }) => fav.id === params.assetId));
      } catch (err) {
        console.error("Failed to load favorite status:", err);
      }
    };

    loadFavoriteStatus();
  }, [params.assetId]);

  const handleToggleFavorite = () => {
    try {
      const favorites = JSON.parse(
        localStorage.getItem("favoriteAssets") || "[]",
      );
      let updatedFavorites;

      if (isFavorite) {
        updatedFavorites = favorites.filter(
          (fav: { id: string }) => fav.id !== params.assetId,
        );
      } else {
        const symbol = assetInfo?.symbol || params.assetId?.toString().toUpperCase();
        const name = assetInfo?.name || params.assetId?.toString().toUpperCase();

        const isAlreadyFavorite = favorites.some(
          (fav: { id: string }) => fav.id === params.assetId,
        );

        if (isAlreadyFavorite) {
          return;
        }

        updatedFavorites = [
          ...favorites,
          {
            id: params.assetId,
            symbol,
            name,
            addedAt: new Date().toISOString(),
          },
        ];
      }

      localStorage.setItem("favoriteAssets", JSON.stringify(updatedFavorites));
      setIsFavorite(!isFavorite);

      const storageEvent = new StorageEvent("storage", {
        key: "favoriteAssets",
        newValue: JSON.stringify(updatedFavorites),
        oldValue: JSON.stringify(favorites),
        storageArea: localStorage,
        url: window.location.href,
      });
      window.dispatchEvent(storageEvent);

      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (err) {
      console.error("Failed to save favorite status:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="advanced-astrology-container">
        <div className="cosmic-background">
          <div className="stars"></div>
          <div className="nebula"></div>
        </div>
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loading />
            <p className="text-gray-400 mt-4">Loading {params.assetId?.toString().toUpperCase()}...</p>
          </div>
        </div>
      </div>
    );
  }

  const assetName = assetInfo?.name || params.assetId?.toString().toUpperCase();
  const assetSymbol = assetInfo?.symbol || params.assetId?.toString().toUpperCase();

  return (
    <div className="advanced-astrology-container">
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="nebula"></div>
      </div>

      <div className="advanced-header">
        <div className="header-content">
          <h1 className="advanced-title">
            <span className="title-glow">{assetName}</span>
          </h1>
          <div className="advanced-subtitle">
            <div className="subtitle-icon">💎</div>
            <span>{assetSymbol} • Trading Dashboard</span>
            <button
              onClick={handleToggleFavorite}
              className={`favorite-toggle ${isFavorite ? 'active' : ''}`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FaStar className={isFavorite ? 'text-yellow-400' : 'text-gray-400'} />
            </button>
          </div>
        </div>
      </div>

      <div className="astrology-content">
        <div className="trading-card">
          <TradeAsset assetId={params.assetId as string} />
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={
      <div className="advanced-astrology-container">
        <div className="cosmic-background">
          <div className="stars"></div>
          <div className="nebula"></div>
        </div>
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loading />
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <TradeContent />
    </Suspense>
  );
}
