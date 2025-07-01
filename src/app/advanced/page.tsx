"use client";

import React, { Suspense, useMemo } from "react";
import LogiaAdvanced from "@/components/LogiaAdvanced";
import { useSearchParams } from "next/navigation";
import Loading from "@/utils/loading";

export default function AdvancedPage() {
  const searchParams = useSearchParams();

  const { birthDate, birthTime, city } = useMemo(() => ({
    birthDate: decodeURIComponent(searchParams.get("birthDate") || ""),
    birthTime: decodeURIComponent(searchParams.get("birthTime") || ""),
    city: decodeURIComponent(searchParams.get("city") || ""),
  }), [searchParams]);

  return (
    <Suspense fallback={<Loading />}>
      <LogiaAdvanced birthDate={birthDate} birthTime={birthTime} city={city} />
    </Suspense>
  );
}
