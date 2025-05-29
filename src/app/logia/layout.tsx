"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function LogiaLayout({
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
