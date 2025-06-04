"use client";

import { TradeAsset } from "../../../components/TradeAsset";
import { useTranslation } from "react-i18next";

export default function TradePage({ params }: { params: { assetId: string } }) {
  const { t } = useTranslation("tradeAsset");

  return (
    <main className="min-h-screen mt-8">
      <h1 className="trade-title">{t("titles.tradingChart")}</h1>
      <TradeAsset assetId={params.assetId} />
    </main>
  );
}
