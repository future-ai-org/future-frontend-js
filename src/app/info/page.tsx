"use client";

import React from "react";
import "../../styles/info.css";
import strings from "../../i18n/info.json";

export default function InfoPage() {
  return (
    <main>
      <div className="info-container">
        <h1 className="info-title">{strings.en.title}</h1>
        <div className="info-box">
          <div className="info-content">
            <p>{strings.en.description.first_paragraph}</p>
            <p>{strings.en.description.second_paragraph}</p>
            <p>{strings.en.description.third_paragraph}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
