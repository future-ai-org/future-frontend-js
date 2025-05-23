"use client";

import React from "react";
import { SliderPrices } from "./SliderPrices";
import { PlanetsSlider } from "./SliderPlanets";
import styles from "src/styles/footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className="w-full">
        <SliderPrices />
        <PlanetsSlider />
      </div>
    </footer>
  );
};
