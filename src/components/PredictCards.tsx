"use client";

import React, { useState } from "react";
import predictI18n from "../i18n/predict.json";
import "./PredictCards.css";

interface PredictCard {
  id: string;
  title: string;
  subtitle: string;
}

// Separate cards into world events and personal predictions
const worldEventCards: PredictCard[] = [
  {
    id: "marketGrowth",
    title: "Market Growth",
    subtitle: "Will the market grow by 10% this year?",
  },
  {
    id: "marketShare",
    title: "Market Share",
    subtitle: "Will our market share increase?",
  },
  {
    id: "partnership",
    title: "Partnership",
    subtitle: "Will we form a new partnership?",
  },
  {
    id: "techInvestment",
    title: "Tech Investment",
    subtitle: "Will we invest in new technology?",
  },
  {
    id: "globalExpansion",
    title: "Global Expansion",
    subtitle: "Will we expand to new international markets?",
  },
  {
    id: "industryTrend",
    title: "Industry Trend",
    subtitle: "Will our industry see major consolidation?",
  },
  {
    id: "regulatoryChange",
    title: "Regulatory Change",
    subtitle: "Will new regulations impact our business?",
  },
  {
    id: "economicOutlook",
    title: "Economic Outlook",
    subtitle: "Will the economy enter a recession?",
  },
  {
    id: "competitorMove",
    title: "Competitor Move",
    subtitle: "Will a major competitor launch a similar product?",
  },
];

const personalPredictionCards: PredictCard[] = [
  {
    id: "newProduct",
    title: "New Product",
    subtitle: "Will the new product launch be successful?",
  },
  {
    id: "customerRetention",
    title: "Customer Retention",
    subtitle: "Will customer retention improve?",
  },
  {
    id: "revenueTarget",
    title: "Revenue Target",
    subtitle: "Will we meet our revenue target?",
  },
  {
    id: "teamExpansion",
    title: "Team Expansion",
    subtitle: "Will we expand the team this quarter?",
  },
  {
    id: "productQuality",
    title: "Product Quality",
    subtitle: "Will our product quality metrics improve?",
  },
  {
    id: "customerSatisfaction",
    title: "Customer Satisfaction",
    subtitle: "Will our NPS score increase?",
  },
  {
    id: "innovation",
    title: "Innovation",
    subtitle: "Will we launch an innovative feature?",
  },
  {
    id: "costReduction",
    title: "Cost Reduction",
    subtitle: "Will we achieve our cost reduction goals?",
  },
  {
    id: "employeeEngagement",
    title: "Employee Engagement",
    subtitle: "Will employee satisfaction scores improve?",
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
          World Events
        </button>
        <button
          className={`tab-button ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Predictions
        </button>
      </div>
      {activeTab === "world"
        ? renderCards(worldEventCards)
        : renderCards(personalPredictionCards)}
    </div>
  );
};

export default PredictCards;
