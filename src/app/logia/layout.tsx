"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";

function LogiaLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSavedView = pathname?.includes("/saved/");

  return (
    <div className={`logia-layout ${isSavedView ? "saved-view" : ""}`}>
      {children}
    </div>
  );
}

export default function LogiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="logia-layout">{children}</div>}>
      <LogiaLayoutContent>{children}</LogiaLayoutContent>
    </Suspense>
  );
}
