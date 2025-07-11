"use client";

import { useState } from "react";
import predictI18n from "../i18n/predict.json";
import "../styles/predict.css";
import { FaChartLine } from "react-icons/fa";

interface PredictCard {
  id: string;
  title: string;
  subtitle: string;
}

const worldEventCards: PredictCard[] = Object.entries(
  predictI18n.finance.targets,
).map(([key, target]) => ({
  id: key,
  title:
    predictI18n.finance.assets[key as keyof typeof predictI18n.finance.assets],
  subtitle: predictI18n.finance.subtitleTemplate
    .replace("{key}", key)
    .replace("{target}", target),
}));

const PredictCards: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<
      string,
      typeof predictI18n.options.yes | typeof predictI18n.options.no | null
    >
  >({});
  const [activeTab, setActiveTab] = useState<
    | typeof predictI18n.tabs.world
    | typeof predictI18n.tabs.personal
    | typeof predictI18n.tabs.relationships
    | typeof predictI18n.tabs.finance
  >(predictI18n.tabs.personal);
  const [question, setQuestion] = useState("");

  const handleOptionClick = (
    cardId: string,
    option: typeof predictI18n.options.yes | typeof predictI18n.options.no,
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [cardId]: prev[cardId] === option ? null : option,
    }));
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      setQuestion("");
    }
  };

  const renderWorldEventCards = () => (
    <div className="predict-cards-grid">
      {worldEventCards.map((card) => (
        <div key={card.id} className="predict-card">
          <div className="card-header">
            <h3 className="card-title">{card.title}</h3>
            <button
              className="predict-view-chart-button"
              title={predictI18n.finance.viewChartTitle}
            >
              <FaChartLine />
            </button>
          </div>
          <p className="card-subtitle">{card.subtitle}</p>
          <div className="card-options">
            <button
              className={`option-button ${selectedOptions[card.id] === predictI18n.options.yes ? "selected" : ""}`}
              onClick={() =>
                handleOptionClick(card.id, predictI18n.options.yes)
              }
            >
              {predictI18n.options.yes}
            </button>
            <button
              className={`option-button ${selectedOptions[card.id] === predictI18n.options.no ? "selected" : ""}`}
              onClick={() => handleOptionClick(card.id, predictI18n.options.no)}
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
          placeholder={predictI18n.personal.placeholder}
          className="question-input"
        />
        <button type="submit" className="submit-button">
          {predictI18n.personal.submit}
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
        <div className="button-container">
          <button className="submit-button">
            {predictI18n.synastry.calculateButton}
          </button>
        </div>
      </div>
    </div>
  );

  const renderWorldCards = () => (
    <div className="predict-card world-card">
      <h3 className="card-title">{predictI18n.world.title}</h3>
      <div className="world-content">
        <p>{predictI18n.world.description}</p>
        <div className="button-container">
          <button className="submit-button">
            {predictI18n.world.comingSoon}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="predict-cards-container">
      <div className="predict-tabs">
        <button
          className={`tab-button ${activeTab === predictI18n.tabs.personal ? "active" : ""}`}
          onClick={() => setActiveTab(predictI18n.tabs.personal)}
        >
          {predictI18n.tabs.personal}
        </button>
        <button
          className={`tab-button ${activeTab === predictI18n.tabs.relationships ? "active" : ""}`}
          onClick={() => setActiveTab(predictI18n.tabs.relationships)}
        >
          {predictI18n.tabs.relationships}
        </button>
        <button
          className={`tab-button ${activeTab === predictI18n.tabs.finance ? "active" : ""}`}
          onClick={() => setActiveTab(predictI18n.tabs.finance)}
        >
          {predictI18n.tabs.finance}
        </button>
        <button
          className={`tab-button ${activeTab === predictI18n.tabs.world ? "active" : ""}`}
          onClick={() => setActiveTab(predictI18n.tabs.world)}
        >
          {predictI18n.tabs.world}
        </button>
      </div>
      {activeTab === predictI18n.tabs.personal
        ? renderPersonalPredictions()
        : activeTab === predictI18n.tabs.relationships
          ? renderRelationshipCards()
          : activeTab === predictI18n.tabs.finance
            ? renderWorldEventCards()
            : renderWorldCards()}
    </div>
  );
};

export default PredictCards;
