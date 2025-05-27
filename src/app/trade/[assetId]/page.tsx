"use client";

import { TradeAsset } from "../../../components/TradeAsset";

export default function TradePage({ params }: { params: { assetId: string } }) {
  return (
    <main className="min-h-screen mt-8">
      <h1 className="trade-title">Trading Chart</h1>
      <TradeAsset assetId={params.assetId} />
    </main>
  );
}
