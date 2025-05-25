import logiaChartTranslations from "../i18n/logiaChart.json";

export const ZODIAC_SIGNS = logiaChartTranslations.en
  .zodiacSigns as readonly string[];

export interface PlanetPosition {
  name: string;
  position: number;
  sign: string;
  house: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

export interface ChartData {
  planets: PlanetPosition[];
  houses: number[];
  aspects: Aspect[];
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  city: string;
  ascendantSign: string;
}

export const PLANET_SYMBOLS = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
} as const;

export const ZODIAC_SYMBOLS = {
  aries: "\u2648",
  taurus: "\u2649",
  gemini: "\u264A",
  cancer: "\u264B",
  leo: "\u264C",
  virgo: "\u264D",
  libra: "\u264E",
  scorpio: "\u264F",
  sagittarius: "\u2650",
  capricorn: "\u2651",
  aquarius: "\u2652",
  pisces: "\u2653",
} as const;

export const ELEMENTS = {
  FIRE: "🜂",
  EARTH: "🜃",
  AIR: "🜁",
  WATER: "🜄",
} as const;

export function getPlanetSymbol(planetName: string): string {
  return (
    PLANET_SYMBOLS[planetName as keyof typeof PLANET_SYMBOLS] || planetName
  );
}

export function getZodiacSymbol(sign: string): string {
  return (
    ZODIAC_SYMBOLS[sign.toLowerCase() as keyof typeof ZODIAC_SYMBOLS] || sign
  );
}

export function getElementForSign(sign: string): string {
  const elementMap: { [key: string]: keyof typeof ELEMENTS } = {
    aries: "FIRE",
    taurus: "EARTH",
    gemini: "AIR",
    cancer: "WATER",
    leo: "FIRE",
    virgo: "EARTH",
    libra: "AIR",
    scorpio: "WATER",
    sagittarius: "FIRE",
    capricorn: "EARTH",
    aquarius: "AIR",
    pisces: "WATER",
  };
  return ELEMENTS[elementMap[sign.toLowerCase()]] || sign;
}

export const HOUSE_ANGLES = [
  150, // House 1 (9 o'clock)
  120, // House 2
  90, // House 3
  60, // House 4 (12 o'clock)
  30, // House 5
  0, // House 6
  330, // House 7 (3 o'clock)
  300, // House 8
  270, // House 9
  240, // House 10 (6 o'clock)
  210, // House 11
  180, // House 12
] as const;
