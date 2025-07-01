"use client";

import { TradeAsset } from "../../../components/TradeAsset";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

export default function TradePage() {
  const params = useParams();
  const { t } = useTranslation("tradeAsset");

  return (
    <main className="min-h-screen mt-8">
      <h1 className="trade-title">{t("titles.tradingChart")}</h1>
      <TradeAsset assetId={params.assetId as string} />
    </main>
  );
}
