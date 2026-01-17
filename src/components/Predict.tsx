"use client";

import { useState } from "react";
import predictI18n from "../i18n/predict.json";
import "../styles/predict.css";

const PredictCards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | typeof predictI18n.tabs.collective
    | typeof predictI18n.tabs.personal
    | typeof predictI18n.tabs.relationships
  >(predictI18n.tabs.personal);
  const [question, setQuestion] = useState("");

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      setQuestion("");
    }
  };

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

  const renderCollectiveCards = () => (
    <div className="predict-card collective-card">
      <h3 className="card-title">{predictI18n.collective.title}</h3>
      <div className="collective-content">
        <p>{predictI18n.collective.description}</p>
        <div className="button-container">
          <button className="submit-button">
            {predictI18n.collective.comingSoon}
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
          className={`tab-button ${activeTab === predictI18n.tabs.collective ? "active" : ""}`}
          onClick={() => setActiveTab(predictI18n.tabs.collective)}
        >
          {predictI18n.tabs.collective}
        </button>
      </div>
      {activeTab === predictI18n.tabs.personal
        ? renderPersonalPredictions()
        : activeTab === predictI18n.tabs.relationships
          ? renderRelationshipCards()
          : renderCollectiveCards()}
    </div>
  );
};

export default PredictCards;
