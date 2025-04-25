"use client";

import { TradeAsset } from "../../../components/TradeAsset";

export default function TradePage({ params }: { params: { assetId: string } }) {
  return (
    <main>
      <TradeAsset assetId={params.assetId} />
    </main>
  );
}
