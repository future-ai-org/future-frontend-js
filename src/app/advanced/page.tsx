"use client";

import React, { Suspense } from "react";
import LogiaAdvanced from "@/components/LogiaAdvanced";
import { useSearchParams } from "next/navigation";
import Loading from "@/utils/loading";

function AdvancedContent() {
  const searchParams = useSearchParams();

  const birthDate = decodeURIComponent(searchParams.get("birthDate") || "");
  const birthTime = decodeURIComponent(searchParams.get("birthTime") || "");
  const city = decodeURIComponent(searchParams.get("city") || "");

  return (
    <LogiaAdvanced birthDate={birthDate} birthTime={birthTime} city={city} />
  );
}

export default function AdvancedPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdvancedContent />
    </Suspense>
  );
}
