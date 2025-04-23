"use client";

import React from "react";
import { Slider } from "./Slider";
import styles from "./styles/footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className="w-full">
        <Slider />
      </div>
    </footer>
  );
};
