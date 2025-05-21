import React from "react";
import strings from "../i18n/logia.json";

const t = strings.en;

export default function LogiaInfoBox() {
  return (
    <div className="logia-info-wrapper">
      <div className="logia-info-box">
        <h2 className="logia-about-title">{t.about.title}</h2>
        <div className="logia-about-features">
          {t.about.features.map((feature, index) => {
            const number = feature.split(" ")[0];
            const text = feature.split(" ").slice(1).join(" ");
            return (
              <p key={index} className="logia-about-feature">
                <span className="logia-feature-number">{number}</span> {text}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
