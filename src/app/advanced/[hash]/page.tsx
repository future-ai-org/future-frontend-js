"use client";

import React, { Suspense } from "react";
import LogiaAdvanced from "@/components/LogiaAdvanced";
import { useParams } from "next/navigation";
import Loading from "@/utils/loading";
import { getBirthDataFromHash } from "@/utils/chartUtils";

function AdvancedContent() {
  const params = useParams();
  const hash = params.hash as string;

  const birthData = getBirthDataFromHash(hash);

  if (!birthData) {
    return null;
  }

  return (
    <LogiaAdvanced
      birthDate={birthData.birthDate}
      birthTime={birthData.birthTime}
      city={birthData.city}
    />
  );
}

export default function AdvancedPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdvancedContent />
    </Suspense>
  );
}
