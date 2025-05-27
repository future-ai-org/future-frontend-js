"use client";

import React, { useState } from "react";
import predictI18n from "../i18n/predict.json";

interface PredictCard {
  id: string;
  title: string;
  subtitle: string;
}

const cards: PredictCard[] = Object.entries(predictI18n.cards).map(
  ([id, content]) => ({
    id,
    title: content.title,
    subtitle: content.subtitle,
  }),
);

const PredictCards: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, "yes" | "no" | null>
  >({});

  const handleOptionClick = (cardId: string, option: "yes" | "no") => {
    setSelectedOptions((prev) => ({
      ...prev,
      [cardId]: prev[cardId] === option ? null : option,
    }));
  };

  return (
    <div className="predict-cards-grid">
      {cards.map((card) => (
        <div key={card.id} className="predict-card">
          <h3 className="card-title">{card.title}</h3>
          <p className="card-subtitle">{card.subtitle}</p>
          <div className="card-options">
            <button
              className={`option-button ${selectedOptions[card.id] === "yes" ? "selected" : ""}`}
              onClick={() => handleOptionClick(card.id, "yes")}
            >
              {predictI18n.options.yes}
            </button>
            <button
              className={`option-button ${selectedOptions[card.id] === "no" ? "selected" : ""}`}
              onClick={() => handleOptionClick(card.id, "no")}
            >
              {predictI18n.options.no}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PredictCards;
