"use client";

import { Suspense } from "react";
import { TradeAsset } from "../../../components/TradeAsset";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import Loading from "../../../utils/loading";

function TradeContent() {
  const params = useParams();
  const { t } = useTranslation("tradeAsset");

  return (
    <main className="min-h-screen mt-8">
      <h1 className="trade-title">{t("titles.tradingChart")}</h1>
      <TradeAsset assetId={params.assetId as string} />
    </main>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={<Loading />}>
      <TradeContent />
    </Suspense>
  );
}
