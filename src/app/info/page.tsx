"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "../../styles/info.css";
import strings from "../../i18n/info.json";
import DecorativeStars from "../../utils/movingStars";

export default function InfoPage() {
  const router = useRouter();

  const handleCalculateLogia = () => {
    router.push("/logia");
  };

  return (
    <main>
      <div className="info-container">
        <h1 className="info-title">{strings.en.title}</h1>
        <DecorativeStars />
        <div className="info-box">
          <div className="info-content">
            <p>{strings.en.description.first_paragraph}</p>
            <p>{strings.en.description.second_paragraph}</p>
            <p>{strings.en.description.third_paragraph}</p>
          </div>
          <div className="info-cta">
            <button onClick={handleCalculateLogia} className="astrology-button">
              {strings.en.cta.button}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
