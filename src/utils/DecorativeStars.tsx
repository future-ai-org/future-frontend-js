import React from "react";

const DecorativeStars: React.FC = () => {
  // Create a grid of positions
  const gridSize = 10; // 10x10 grid
  const positions = [];

  // Generate base grid positions
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Skip positions in the header area
      if (row < 2) continue;

      // Calculate base position
      const baseTop = (row / gridSize) * 100;
      const baseLeft = (col / gridSize) * 100;

      // Add some randomness to the position
      const top = baseTop + (Math.random() * 8 - 4); // ±4% variation
      const left = baseLeft + (Math.random() * 8 - 4); // ±4% variation

      positions.push({ top, left });
    }
  }

  // Shuffle the positions
  const shuffledPositions = positions.sort(() => Math.random() - 0.5);

  // Take only the number of stars we want
  const stars = shuffledPositions.slice(0, 50).map((pos, index) => {
    const twinkleDelay = Math.random() * 2;
    const floatDelay = Math.random() * 7;
    const size = Math.random() * 10 + 6; // Size range: 6-16px
    const opacity = Math.random() * 0.4 + 0.1; // Varying opacity: 0.2-0.6

    return (
      <div
        key={index}
        className="decorative-star"
        style={{
          top: `${pos.top}%`,
          left: `${pos.left}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${twinkleDelay}s, ${floatDelay}s`,
          opacity: opacity,
        }}
      />
    );
  });

  return <>{stars}</>;
};

export default DecorativeStars;
