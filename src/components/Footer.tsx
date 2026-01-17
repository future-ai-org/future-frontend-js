"use client";

import React from "react";
import { SliderPlanets } from "./SliderPlanets";
import styles from "../styles/footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className="w-full">
        <SliderPlanets />
      </div>
    </footer>
  );
};
