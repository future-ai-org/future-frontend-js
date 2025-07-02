"use client";

import { useEffect, useState } from "react";

export const useCssLoader = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure CSS variables are properly set
    const ensureCssVariables = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      // Check if CSS variables are loaded
      const primaryColor = computedStyle.getPropertyValue("--color-primary");
      const cardBg = computedStyle.getPropertyValue("--card-bg");

      if (primaryColor && cardBg) {
        setIsLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(ensureCssVariables, 50);
      }
    };

    ensureCssVariables();
  }, []);

  return isLoaded;
};
