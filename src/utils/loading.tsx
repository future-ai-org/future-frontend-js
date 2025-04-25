import React from "react";
import "../styles/loading.css";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-dots-container">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
      </div>
    </div>
  );
} 
