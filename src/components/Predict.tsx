"use client";

import React from "react";
import "../styles/predict.css";
import strings from "../i18n/predict.json";

export default function Predict() {
  return (
    <div className="predict-container">
      <div className="predict-header">
        <h1 className="astrology-title">{strings.en.title}</h1>
      </div>
      <div className="predict-content"></div>
    </div>
  );
}
