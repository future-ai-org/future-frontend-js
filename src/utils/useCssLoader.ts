"use client";

import { useEffect, useState } from "react";

export const useCssLoader = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const ensureCssVariables = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const primaryColor = computedStyle.getPropertyValue("--color-primary");
      const cardBg = computedStyle.getPropertyValue("--card-bg");

      if (primaryColor && cardBg) {
        setIsLoaded(true);
      } else {
        setTimeout(ensureCssVariables, 50);
      }
    };

    ensureCssVariables();
  }, []);

  return isLoaded;
};
