"use client";

import React, { useState } from "react";
import predictI18n from "../i18n/predict.json";
import "../styles/predictCards.css";

interface PredictCard {
  id: string;
  title: string;
  subtitle: string;
}

const worldEventCards: PredictCard[] = [
  {
    id: "one",
    title: predictI18n.cards.worldEvents.one.title,
    subtitle: predictI18n.cards.worldEvents.one.subtitle,
  },
  {
    id: "two",
    title: predictI18n.cards.worldEvents.two.title,
    subtitle: predictI18n.cards.worldEvents.two.subtitle,
  },
  {
    id: "three",
    title: predictI18n.cards.worldEvents.three.title,
    subtitle: predictI18n.cards.worldEvents.three.subtitle,
  },
  {
    id: "four",
    title: predictI18n.cards.worldEvents.four.title,
    subtitle: predictI18n.cards.worldEvents.four.subtitle,
  },
  {
    id: "five",
    title: predictI18n.cards.worldEvents.five.title,
    subtitle: predictI18n.cards.worldEvents.five.subtitle,
  },
  {
    id: "six",
    title: predictI18n.cards.worldEvents.six.title,
    subtitle: predictI18n.cards.worldEvents.six.subtitle,
  },
  {
    id: "seven",
    title: predictI18n.cards.worldEvents.seven.title,
    subtitle: predictI18n.cards.worldEvents.seven.subtitle,
  },
  {
    id: "eight",
    title: predictI18n.cards.worldEvents.eight.title,
    subtitle: predictI18n.cards.worldEvents.eight.subtitle,
  },
  {
    id: "nine",
    title: predictI18n.cards.worldEvents.nine.title,
    subtitle: predictI18n.cards.worldEvents.nine.subtitle,
  },
];

const personalPredictionCards: PredictCard[] = [
  {
    id: "one",
    title: predictI18n.cards.personalPredictions.one.title,
    subtitle: predictI18n.cards.personalPredictions.one.subtitle,
  },
  {
    id: "two",
    title: predictI18n.cards.personalPredictions.two.title,
    subtitle: predictI18n.cards.personalPredictions.two.subtitle,
  },
  {
    id: "three",
    title: predictI18n.cards.personalPredictions.three.title,
    subtitle: predictI18n.cards.personalPredictions.three.subtitle,
  },
  {
    id: "four",
    title: predictI18n.cards.personalPredictions.four.title,
    subtitle: predictI18n.cards.personalPredictions.four.subtitle,
  },
  {
    id: "five",
    title: predictI18n.cards.personalPredictions.five.title,
    subtitle: predictI18n.cards.personalPredictions.five.subtitle,
  },
  {
    id: "six",
    title: predictI18n.cards.personalPredictions.six.title,
    subtitle: predictI18n.cards.personalPredictions.six.subtitle,
  },
  {
    id: "seven",
    title: predictI18n.cards.personalPredictions.seven.title,
    subtitle: predictI18n.cards.personalPredictions.seven.subtitle,
  },
  {
    id: "eight",
    title: predictI18n.cards.personalPredictions.eight.title,
    subtitle: predictI18n.cards.personalPredictions.eight.subtitle,
  },
  {
    id: "nine",
    title: predictI18n.cards.personalPredictions.nine.title,
    subtitle: predictI18n.cards.personalPredictions.nine.subtitle,
  },
];

const PredictCards: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, "yes" | "no" | null>
  >({});
  const [activeTab, setActiveTab] = useState<"world" | "personal">("world");

  const handleOptionClick = (cardId: string, option: "yes" | "no") => {
    setSelectedOptions((prev) => ({
      ...prev,
      [cardId]: prev[cardId] === option ? null : option,
    }));
  };

  const renderCards = (cards: PredictCard[]) => (
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

  return (
    <div className="predict-cards-container">
      <div className="predict-tabs">
        <button
          className={`tab-button ${activeTab === "world" ? "active" : ""}`}
          onClick={() => setActiveTab("world")}
        >
          {predictI18n.tabs.worldEvents}
        </button>
        <button
          className={`tab-button ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          {predictI18n.tabs.personalPredictions}
        </button>
      </div>
      {activeTab === "world"
        ? renderCards(worldEventCards)
        : renderCards(personalPredictionCards)}
    </div>
  );
};

export default PredictCards;
