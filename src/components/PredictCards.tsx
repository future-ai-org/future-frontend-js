"use client";

import React, { useState } from "react";
import predictI18n from "../i18n/predict.json";
import "../styles/predictCards.css";
import { FaChartLine } from "react-icons/fa";

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

const PredictCards: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, "yes" | "no" | null>
  >({});
  const [activeTab, setActiveTab] = useState<
    "world" | "personal" | "relationships"
  >("personal");
  const [question, setQuestion] = useState("");

  const handleOptionClick = (cardId: string, option: "yes" | "no") => {
    setSelectedOptions((prev) => ({
      ...prev,
      [cardId]: prev[cardId] === option ? null : option,
    }));
  };

  const handleCalculateSynastry = () => {
    // Synastry calculation will be implemented in future updates
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Question submission will be implemented in future updates
    setQuestion("");
  };

  const renderWorldEventCards = () => (
    <div className="predict-cards-grid">
      {worldEventCards.map((card) => (
        <div key={card.id} className="predict-card">
          <div className="card-header">
            <h3 className="card-title">{card.title}</h3>
            <button className="view-chart-button" title="View Chart">
              <FaChartLine />
            </button>
          </div>
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

  const renderPersonalPredictions = () => (
    <div className="personal-predictions-container">
      <form onSubmit={handleQuestionSubmit} className="question-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="question-input"
        />
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );

  const renderRelationshipCards = () => (
    <div className="predict-card synastry-card">
      <h3 className="card-title">{predictI18n.synastry.title}</h3>
      <div className="synastry-content">
        <p>{predictI18n.synastry.description}</p>
        <p>{predictI18n.synastry.analysis}</p>
        <ul>
          {predictI18n.synastry.insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
        <p>{predictI18n.synastry.conclusion}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          <button className="submit-button" onClick={handleCalculateSynastry}>
            calculate a synastry
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="predict-cards-container">
      <div className="predict-tabs">
        <button
          className={`tab-button ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          {predictI18n.tabs.personalPredictions}
        </button>
        <button
          className={`tab-button ${activeTab === "relationships" ? "active" : ""}`}
          onClick={() => setActiveTab("relationships")}
        >
          {predictI18n.tabs.relationships}
        </button>
        <button
          className={`tab-button ${activeTab === "world" ? "active" : ""}`}
          onClick={() => setActiveTab("world")}
        >
          {predictI18n.tabs.worldEvents}
        </button>
      </div>
      {activeTab === "personal"
        ? renderPersonalPredictions()
        : activeTab === "relationships"
          ? renderRelationshipCards()
          : renderWorldEventCards()}
    </div>
  );
};

export default PredictCards;
