import React from "react";
import { Slider } from "./Slider";
import "../styles/footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="w-full">
        <Slider />
      </div>
    </footer>
  );
};
