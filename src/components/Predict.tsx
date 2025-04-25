"use client";

import React from "react";
import "../styles/predict.css";
import strings from "../i18n/predict.json";

export default function Predict() {
  return (
    <div className="predict-container">
      <div className="predict-content">
        <p className="predict-description">{strings.en.description}</p>
      </div>
    </div>
  );
}
