import React from "react";
import "../styles/about.css";
import strings from "../i18n/about.json";

export default function About() {
  return (
    <div className="aboutContainer">
      <h1 className="page-title">{strings.en.about.title}</h1>
      <section className="aboutSection">
        <p className="aboutParagraph">{strings.en.about.welcome}</p>
        <p className="aboutParagraph">{strings.en.about.mission}</p>
      </section>
    </div>
  );
}
