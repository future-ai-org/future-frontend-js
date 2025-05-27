import React from "react";

const DecorativeStars: React.FC = () => {
  // Create a grid of positions
  const gridSize = 15;
  const positions = [];

  // Generate base grid positions
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Skip positions in the header area
      if (row < 2) continue;

      // Calculate base position
      const baseTop = (row / gridSize) * 100;
      const baseLeft = (col / gridSize) * 100;

      // Only place stars in the outer areas (around the text box)
      const isInOuterArea =
        baseTop < 25 || // Above the box
        baseTop > 85 || // Below the box
        baseLeft < 10 || // Left of the box
        baseLeft > 90; // Right of the box

      if (!isInOuterArea) continue;

      // Add more randomness to the position
      const top = baseTop + (Math.random() * 12 - 6); // ±6% variation
      const left = baseLeft + (Math.random() * 12 - 6); // ±6% variation

      positions.push({ top, left });
    }
  }

  // Shuffle the positions
  const shuffledPositions = positions.sort(() => Math.random() - 0.5);

  // Take more stars
  const stars = shuffledPositions.slice(0, 40).map((pos, index) => {
    const twinkleDelay = Math.random() * 2;
    const floatDelay = Math.random() * 7;
    const size = Math.random() * 12 + 8; // Size range: 8-20px
    const opacity = Math.random() * 0.5 + 0.2; // Varying opacity: 0.2-0.7

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
