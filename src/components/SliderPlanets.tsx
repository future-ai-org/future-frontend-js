"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import "../styles/slider_planets.css";
import { PLANET_SYMBOLS, ZODIAC_SYMBOLS } from "../config/logiaChart";
import {
  LOS_ANGELES_LATITUDE,
  LOS_ANGELES_LONGITUDE,
  REFRESH_INTERVAL,
} from "../config/slider_planets";
import sliderPlanetsData from "../i18n/slider_planets.json";

interface PlanetPosition {
  name: string;
  sign: string;
  position: number;
}

interface PlanetApiResponse {
  sign: string;
  degrees: number;
}

interface ApiResponse {
  [key: string]: PlanetApiResponse;
}

const formatPosition = (position: number): string => {
  return `${position.toFixed(2)}°`;
};

const getZodiacSymbol = (sign: string): string => {
  return (
    ZODIAC_SYMBOLS[sign.toLowerCase() as keyof typeof ZODIAC_SYMBOLS] || sign
  );
};

const renderItem = (planet: PlanetPosition | null, index: number) => {
  const symbol = planet?.name
    ? PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS]
    : "?";
  const sign = planet?.sign ? getZodiacSymbol(planet.sign) : "-";
  const position = planet ? formatPosition(planet.position) : "-";

  return (
    <div
      className={`planet-item ${planet ? "active" : "loading"}`}
      key={`${planet ? `${planet.name}-` : "loading-"}${index}`}
    >
      <span className="symbol">{symbol}</span>
      <span className="sign">{sign}</span>
      <span className="position">{position}</span>
    </div>
  );
};

export const SliderPlanets: React.FC = () => {
  const [planets, setPlanets] = useState<PlanetPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlanets = useCallback(async () => {
    try {
      setIsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_LILIT_ASTRO_API_URL;
      if (!baseUrl) {
        throw new Error(sliderPlanetsData.en.errors.apiUrlNotConfigured);
      }

      const now = new Date();
      const requestBody = {
        date_time: now.toISOString(),
        latitude: LOS_ANGELES_LATITUDE,
        longitude: LOS_ANGELES_LONGITUDE,
      };

      const response = await fetch(`${baseUrl}/planets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          API_KEY: process.env.NEXT_PUBLIC_LILIT_ASTRO_API_KEY!,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = (await response.json()) as ApiResponse;
      const formattedPlanets = Object.entries(data).map(([name, info]) => ({
        name: name.toLowerCase(),
        sign: info.sign.toLowerCase(),
        position: info.degrees,
      }));

      setPlanets(formattedPlanets);
      setIsLoading(false);
    } catch (error) {
      console.error(
        sliderPlanetsData.en.errors.fetchPlanetsFailed.replace(
          "{error}",
          error instanceof Error ? error.message : String(error),
        ),
      );
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanets();
    const interval = setInterval(fetchPlanets, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPlanets]);

  const duplicatedPlanets = useMemo(
    () => Array(6).fill(planets).flat(),
    [planets],
  );

  const displayPlanets = isLoading ? Array(6).fill(null) : duplicatedPlanets;

  return (
    <div className="planets-slider">
      <div className="planets-items-container">
        {displayPlanets.map((planet, index) => renderItem(planet, index))}
      </div>
    </div>
  );
};
