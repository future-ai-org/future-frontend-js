'use client';

import { Trading } from '../../../components/Trading';

export default function TradingPage({ params }: { params: { assetId: string } }) {
  return (
    <main>
      <Trading assetId={params.assetId} />
    </main>
  );
} 
