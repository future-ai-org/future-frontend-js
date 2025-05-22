import React from "react";

const createStar = (cx: number, cy: number, r: number) => {
  const points = [];
  const innerRadius = r * 0.4;

  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : innerRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
};

export const SpaceDecoration = () => {
  return (
    <svg
      viewBox="0 0 600 600"
      className="logia-image"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <polygon
          key={`star-${i}`}
          points={createStar(
            Math.random() * 500 + 50,
            Math.random() * 500 + 50,
            Math.random() * 6 + 5,
          )}
          fill="var(--color-primary)"
          opacity={0.6}
        />
      ))}

      {/* Saturn */}
      <g className="saturn-group">
        <circle
          cx="300"
          cy="300"
          r="120"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="3"
          opacity="0.8"
        />
        <circle
          cx="300"
          cy="300"
          r="90"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          opacity="0.6"
        />
        <circle
          cx="300"
          cy="300"
          r="60"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          opacity="0.7"
        />
        <circle
          cx="300"
          cy="300"
          r="30"
          fill="var(--color-primary)"
          opacity="0.3"
        />
      </g>

      {/* Rings */}
      <ellipse
        cx="300"
        cy="300"
        rx="180"
        ry="60"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3"
        opacity="0.8"
        transform="rotate(-20 300 300)"
      />
      <ellipse
        cx="300"
        cy="300"
        rx="150"
        ry="45"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        opacity="0.6"
        transform="rotate(-20 300 300)"
      />
      <ellipse
        cx="300"
        cy="300"
        rx="120"
        ry="40"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        opacity="0.4"
        transform="rotate(-20 300 300)"
      />
    </svg>
  );
}; 
