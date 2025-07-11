"use client";

import { useEffect, useState } from "react";

interface StarPosition {
  top: number;
  left: number;
  twinkleDelay: number;
  floatDelay: number;
  size: number;
  opacity: number;
}

const DecorativeStars: React.FC = () => {
  const [stars, setStars] = useState<StarPosition[]>([]);

  useEffect(() => {
    const gridSize = 15;
    const positions: StarPosition[] = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (row < 2) continue;

        const baseTop = (row / gridSize) * 100;
        const baseLeft = (col / gridSize) * 100;

        const isInOuterArea =
          baseTop < 25 || baseTop > 85 || baseLeft < 10 || baseLeft > 90;

        if (!isInOuterArea) continue;

        const top = baseTop + (Math.random() * 12 - 6);
        const left = baseLeft + (Math.random() * 12 - 6);
        const twinkleDelay = Math.random() * 2;
        const floatDelay = Math.random() * 7;
        const size = Math.random() * 12 + 8;
        const opacity = Math.random() * 0.5 + 0.2;

        positions.push({ top, left, twinkleDelay, floatDelay, size, opacity });
      }
    }

    const shuffledPositions = positions
      .sort(() => Math.random() - 0.5)
      .slice(0, 40);
    setStars(shuffledPositions);
  }, []);

  return (
    <>
      {stars.map((star, index) => (
        <div
          key={index}
          className="decorative-star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.twinkleDelay}s, ${star.floatDelay}s`,
            opacity: star.opacity,
          }}
        />
      ))}
    </>
  );
};

export default DecorativeStars;
