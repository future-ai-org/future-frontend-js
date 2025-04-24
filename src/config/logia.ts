export const OPENSTREETMAP_API_URL =
  "https://nominatim.openstreetmap.org/search?format=json&q=";

export const ZODIAC_SIGNS = [
  "pisces",
  "aquarius",
  "capricorn",
  "sagittarius",
  "scorpio",
  "libra",
  "virgo",
  "leo",
  "cancer",
  "gemini",
  "taurus",
  "aries",
] as const;

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
}

const PLANET_SYMBOLS = {
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

const ZODIAC_SYMBOLS = {
  aries: "♈︎",
  taurus: "♉︎",
  gemini: "♊︎",
  cancer: "♋︎",
  leo: "♌︎",
  virgo: "♍︎",
  libra: "♎︎",
  scorpio: "♏︎",
  sagittarius: "♐︎",
  capricorn: "♑︎",
  aquarius: "♒︎",
  pisces: "♓︎",
} as const;

const ASPECTS = [
  { name: "conjunction", degrees: 0, orb: 8 },
  { name: "sextile", degrees: 60, orb: 8 },
  { name: "square", degrees: 90, orb: 8 },
  { name: "trine", degrees: 120, orb: 8 },
  { name: "opposition", degrees: 180, orb: 8 },
] as const;

export function calculateChart(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
): ChartData {
  // Parse the date and time components
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hours, minutes] = birthTime.split(":").map(Number);

  // Create date object in local time
  const localDate = new Date(year, month - 1, day, hours, minutes);

  // Get the timezone offset in minutes
  const timezoneOffset = localDate.getTimezoneOffset();

  // Create UTC date by subtracting the timezone offset
  const utcDate = new Date(localDate.getTime() - timezoneOffset * 60000);

  // Calculate Julian Day at midnight UTC
  const julianDay = getJulianDay(utcDate);

  // Calculate sidereal time at Greenwich
  const greenwichSiderealTime = calculateSiderealTime(julianDay, 0);

  // Adjust sidereal time for the observer's longitude
  const localSiderealTime = (greenwichSiderealTime + longitude) % 360;

  // Calculate ascendant
  const ascendant = calculateAscendant(localSiderealTime, latitude, julianDay);

  // Calculate planet positions
  const planets: PlanetPosition[] = [
    calculatePlanetPosition("sun", julianDay),
    calculatePlanetPosition("moon", julianDay),
    calculatePlanetPosition("mercury", julianDay),
    calculatePlanetPosition("venus", julianDay),
    calculatePlanetPosition("mars", julianDay),
    calculatePlanetPosition("jupiter", julianDay),
    calculatePlanetPosition("saturn", julianDay),
    calculatePlanetPosition("uranus", julianDay),
    calculatePlanetPosition("neptune", julianDay),
    calculatePlanetPosition("pluto", julianDay),
  ].map((planet) => ({
    ...planet,
    // Keep position as is for anti-clockwise
    position: planet.position,
    // Calculate sign based on position
    sign: ZODIAC_SIGNS[Math.floor(planet.position / 30)],
  }));

  // Calculate house cusps using whole house system
  const houses = calculateHouses(ascendant);

  // Calculate aspects
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const angle = Math.abs(planets[i].position - planets[j].position);
      const normalizedAngle = Math.min(angle, 360 - angle);

      for (const aspect of ASPECTS) {
        if (Math.abs(normalizedAngle - aspect.degrees) <= aspect.orb) {
          aspects.push({
            planet1: planets[i].name.toLowerCase(),
            planet2: planets[j].name.toLowerCase(),
            type: aspect.name,
            orb: Math.abs(normalizedAngle - aspect.degrees),
          });
        }
      }
    }
  }

  return {
    planets: planets.map((p) => ({
      ...p,
      name: p.name.toLowerCase(),
      sign: p.sign.toLowerCase(),
    })),
    houses,
    aspects,
  };
}

// Helper functions for astronomical calculations
function getJulianDay(date: Date): number {
  // Get the UTC components
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;

  // Calculate Julian Day Number
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  // Calculate Julian Day Number at noon UTC
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Add the fraction of the day
  return jdn + (hour - 12) / 24;
}

function calculateSiderealTime(julianDay: number, longitude: number): number {
  // Calculate the number of Julian centuries since J2000.0
  const T = (julianDay - 2451545.0) / 36525;

  // Calculate mean sidereal time at Greenwich
  let theta =
    280.46061837 +
    360.98564736629 * (julianDay - 2451545.0) +
    T * T * (0.000387933 - T / 38710000);

  // Add the observer's longitude
  theta = (theta + longitude) % 360;

  // Normalize to 0-360 range
  if (theta < 0) {
    theta += 360;
  }

  return theta;
}

function calculateAscendant(
  siderealTime: number,
  latitude: number,
  julianDay: number,
): number {
  // Convert to radians
  const T = (siderealTime * Math.PI) / 180;
  const lat = (latitude * Math.PI) / 180;

  // Calculate the obliquity of the ecliptic (ε)
  const T_centuries = (julianDay - 2451545.0) / 36525;
  const epsilon =
    ((23.4392911 -
      0.0130042 * T_centuries -
      0.00000016 * T_centuries * T_centuries +
      0.000000504 * T_centuries * T_centuries * T_centuries) *
      Math.PI) /
    180;

  // Calculate the ascendant using the standard formula
  const tanAsc =
    (Math.cos(T) * Math.sin(epsilon) + Math.tan(lat) * Math.cos(epsilon)) /
    Math.sin(T);
  let ascendant = (Math.atan(tanAsc) * 180) / Math.PI;

  // Adjust for quadrant
  if (Math.sin(T) < 0) {
    ascendant += 180;
  }

  // Normalize to 0-360 range and adjust for anti-clockwise direction
  ascendant = (360 - ascendant) % 360;

  return ascendant;
}

function calculatePlanetPosition(
  planet: string,
  julianDay: number,
): PlanetPosition {
  if (planet === "sun") {
    // Calculate the sun's position using the actual astronomical formula
    const T = (julianDay - 2451545.0) / 36525;

    // Mean longitude of the sun
    const _L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

    // Mean anomaly of the sun
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;

    // Sun's equation of center
    const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) *
        Math.sin((M * Math.PI) / 180) +
      (0.019993 - 0.000101 * T) * Math.sin((2 * M * Math.PI) / 180) +
      0.000289 * Math.sin((3 * M * Math.PI) / 180);

    // True longitude of the sun
    const trueLongitude = _L0 + C;

    // Normalize to 0-360 range
    let position = trueLongitude % 360;
    if (position < 0) position += 360;

    // Calculate the sign based on the actual zodiac boundaries
    const signIndex = Math.floor(position / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const house = (Math.floor((position + 30) / 30) % 12) + 1;

    return {
      name: planet,
      position,
      sign,
      house,
    };
  }

  if (planet === "moon") {
    // Calculate the moon's position using ELP2000-82 theory
    const T = (julianDay - 2451545.0) / 36525;

    // Mean longitude of the moon
    const _L0 =
      218.3164477 +
      481267.88123421 * T -
      0.0015786 * T * T +
      (T * T * T) / 538841 -
      (T * T * T * T) / 65194000;

    // Mean elongation of the moon
    const D =
      297.8501921 +
      445267.1114034 * T -
      0.0018819 * T * T +
      (T * T * T) / 545868 -
      (T * T * T * T) / 113065000;

    // Mean anomaly of the sun
    const M =
      357.5291092 +
      35999.0502909 * T -
      0.0001536 * T * T +
      (T * T * T) / 24490000;

    // Mean anomaly of the moon
    const M_prime =
      134.9633964 +
      477198.8675055 * T +
      0.0087414 * T * T +
      (T * T * T) / 69699 -
      (T * T * T * T) / 14712000;

    // Mean distance of the moon from its ascending node
    const F =
      93.272095 +
      483202.0175233 * T -
      0.0036539 * T * T -
      (T * T * T) / 3526000 +
      (T * T * T * T) / 863310000;

    // Calculate the moon's longitude using the main periodic terms
    const longitude =
      _L0 +
      6.288774 * Math.sin((M_prime * Math.PI) / 180) +
      1.274018 * Math.sin(((2 * D - M_prime) * Math.PI) / 180) +
      0.658309 * Math.sin((2 * D * Math.PI) / 180) +
      0.213616 * Math.sin((2 * M_prime * Math.PI) / 180) +
      -0.185596 * Math.sin((M * Math.PI) / 180) +
      -0.114336 * Math.sin((2 * F * Math.PI) / 180) +
      0.058793 * Math.sin(((2 * D - 2 * M_prime) * Math.PI) / 180) +
      0.057212 * Math.sin(((2 * D - M - M_prime) * Math.PI) / 180) +
      0.05332 * Math.sin(((2 * D + M_prime) * Math.PI) / 180) +
      0.045874 * Math.sin(((2 * D - M) * Math.PI) / 180) +
      0.041024 * Math.sin(M_prime - (M * Math.PI) / 180) +
      -0.034718 * Math.sin((D * Math.PI) / 180) +
      -0.030465 * Math.sin(M_prime + (M * Math.PI) / 180) +
      0.015326 * Math.sin(((2 * D - 2 * F) * Math.PI) / 180) +
      -0.012528 * Math.sin(((2 * F + M_prime) * Math.PI) / 180) +
      -0.01098 * Math.sin(((2 * F - M_prime) * Math.PI) / 180) +
      0.010674 * Math.sin(((4 * D - M_prime) * Math.PI) / 180) +
      0.010034 * Math.sin((3 * M_prime * Math.PI) / 180) +
      0.008548 * Math.sin(((4 * D - 2 * M_prime) * Math.PI) / 180) +
      -0.00791 * Math.sin(((M - M_prime - 2 * D) * Math.PI) / 180) +
      -0.006783 * Math.sin(((2 * D + M) * Math.PI) / 180) +
      0.005162 * Math.sin(((M_prime - D) * Math.PI) / 180) +
      0.005 * Math.sin(((M_prime + D) * Math.PI) / 180) +
      0.004049 * Math.sin(((2 * M_prime - M) * Math.PI) / 180) +
      0.003996 * Math.sin(((2 * M_prime + M) * Math.PI) / 180) +
      0.003862 * Math.sin((4 * D * Math.PI) / 180) +
      0.003665 * Math.sin(((2 * D - 3 * M_prime) * Math.PI) / 180) +
      0.002695 * Math.sin(((2 * M_prime - 2 * F) * Math.PI) / 180) +
      0.002602 * Math.sin(((M_prime - 2 * F - 2 * D) * Math.PI) / 180) +
      0.002396 * Math.sin(((2 * D - M_prime - 2 * F) * Math.PI) / 180) +
      -0.002349 * Math.sin(((M_prime + M) * Math.PI) / 180) +
      0.002249 * Math.sin(((2 * D - 2 * M_prime - M) * Math.PI) / 180) +
      -0.002125 * Math.sin(((2 * M_prime + M) * Math.PI) / 180) +
      -0.002079 * Math.sin((2 * M_prime * Math.PI) / 180) +
      0.002059 * Math.sin(((2 * D - M_prime - 2 * M) * Math.PI) / 180) +
      -0.001773 * Math.sin(((M_prime + 2 * D - 2 * F) * Math.PI) / 180) +
      -0.001595 * Math.sin(((2 * F + 2 * D) * Math.PI) / 180) +
      0.00122 * Math.sin(((4 * D - M - M_prime) * Math.PI) / 180) +
      -0.00111 * Math.sin(((2 * M_prime + 2 * F) * Math.PI) / 180) +
      0.000892 * Math.sin(((M_prime - 3 * D) * Math.PI) / 180) +
      -0.000811 * Math.sin(((M + M_prime + 2 * D) * Math.PI) / 180) +
      0.000761 * Math.sin(((4 * D - M - 2 * M_prime) * Math.PI) / 180) +
      0.000717 * Math.sin(((M_prime - 2 * M) * Math.PI) / 180) +
      0.000704 * Math.sin(((M_prime - M - 2 * D) * Math.PI) / 180) +
      0.000693 * Math.sin(((M - 2 * M_prime + 2 * D) * Math.PI) / 180) +
      0.000598 * Math.sin(((2 * D - M - 2 * F) * Math.PI) / 180) +
      0.00055 * Math.sin(((M_prime + 4 * D) * Math.PI) / 180) +
      0.000538 * Math.sin((4 * M_prime * Math.PI) / 180) +
      0.000521 * Math.sin(((4 * D - M) * Math.PI) / 180) +
      0.000486 * Math.sin(((2 * M_prime - D) * Math.PI) / 180);

    // Normalize to 0-360 range
    let position = longitude % 360;
    if (position < 0) position += 360;

    // Calculate the sign based on the actual zodiac boundaries
    const signIndex = Math.floor(position / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const house = (Math.floor((position + 30) / 30) % 12) + 1;

    return {
      name: planet,
      position,
      sign,
      house,
    };
  }

  if (planet === "mercury") {
    // Calculate Mercury's position using VSOP87 theory
    const T = (julianDay - 2451545.0) / 36525;

    // Mean anomaly of Mercury
    const M = 174.7910857 + 149472.51529 * T + 0.00000114 * T * T;

    // Eccentricity of Mercury's orbit
    const _e = 0.20563175 + 0.000020406 * T - 0.0000000284 * T * T;

    // Argument of perihelion
    const w = 29.12478 + 1.01444 * T + 0.000163 * T * T;

    // Calculate eccentric anomaly using Newton-Raphson method
    let E = M;
    for (let j = 0; j < 5; j++) {
      E =
        E -
        (E - _e * Math.sin((E * Math.PI) / 180) - M) /
          (1 - _e * Math.cos((E * Math.PI) / 180));
    }

    // Calculate true anomaly
    const v =
      (2 *
        Math.atan(
          Math.sqrt((1 + _e) / (1 - _e)) * Math.tan((E * Math.PI) / 360),
        ) *
        180) /
      Math.PI;

    // Calculate heliocentric longitude
    const longitude = (v + w) % 360;

    // Calculate final position
    const position = (longitude + 360) % 360;

    // Calculate the sign based on the actual zodiac boundaries
    const signIndex = Math.floor(position / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const house = (Math.floor((position + 30) / 30) % 12) + 1;

    return {
      name: planet,
      position,
      sign,
      house,
    };
  }

  // For other planets, use the simplified calculation
  // Basic orbital periods (in days)
  const periods: { [key: string]: number } = {
    moon: 27.3217,
    mercury: 87.969,
    venus: 224.701,
    mars: 686.98,
    jupiter: 4332.59,
    saturn: 10759.22,
    uranus: 30685.4,
    neptune: 60189,
    pluto: 90560,
  };

  const position = ((julianDay / periods[planet]) % 1) * 360;

  const signIndex = Math.floor(position / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const house = (Math.floor((position + 30) / 30) % 12) + 1;

  return {
    name: planet,
    position,
    sign,
    house,
  };
}

function calculateHouses(ascendant: number): number[] {
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    const houseCusp = (ascendant + i * 30) % 360;
    houses.push(houseCusp);
  }

  return houses;
}

type PlanetName = keyof typeof PLANET_SYMBOLS;
type ZodiacSign = keyof typeof ZODIAC_SYMBOLS;

export function getPlanetSymbol(planetName: string): string {
  return PLANET_SYMBOLS[planetName as PlanetName] || planetName;
}

export function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign as ZodiacSign] || sign;
}

export function printChartInfo(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  city: string,
): string {
  const chart = calculateChart(birthDate, birthTime, latitude, longitude);
  const date = new Date(`${birthDate}T${birthTime}`);
  const formattedDate = date.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-us", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  // Calculate ascendant directly from birth data
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hours, minutes] = birthTime.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes);
  const timezoneOffset = localDate.getTimezoneOffset();
  const utcDate = new Date(localDate.getTime() - timezoneOffset * 60000);
  const julianDay = getJulianDay(utcDate);
  const greenwichSiderealTime = calculateSiderealTime(julianDay, 0);
  const localSiderealTime = (greenwichSiderealTime + longitude) % 360;
  const ascendant = calculateAscendant(localSiderealTime, latitude, julianDay);

  const ascendantDegree = ascendant % 30;
  const ascendantSign = ZODIAC_SIGNS[Math.floor(ascendant / 30)];

  const planetPositions = chart.planets
    .map((planet) => {
      const housePosition = planet.position % 30;
      return `
    <div class="astrology-position">
      <span class="astrology-position-label">${getPlanetSymbol(planet.name)} ${planet.name.toLowerCase()}</span>
      <span class="astrology-position-value">${planet.sign.toLowerCase()} ${housePosition.toFixed(2)}° h${planet.house} ${getZodiacSymbol(planet.sign)}</span>
    </div>
  `;
    })
    .join("");

  return `
    <div class="astrology-chart-header">
      <div class="astrology-chart-date">${formattedDate.toLowerCase()}</div>
      <div class="astrology-chart-time">${formattedTime.toLowerCase()}</div>
      <div class="astrology-chart-location">
        <span class="astrology-chart-city">${city.toLowerCase()}</span>
      </div>
    </div>
    <div class="astrology-positions">
      <div class="astrology-position">
        <span class="astrology-position-label">ascendant</span>
        <span class="astrology-position-value">${ascendantSign.toLowerCase()} ${getZodiacSymbol(ascendantSign)}, ${ascendantDegree.toFixed(2)}° ASC</span>
      </div>
      ${planetPositions}
    </div>
  `;
}

export function getEmptyChart(): string {
  return `
    <div class="astrology-chart-header">
      <div class="astrology-chart-date">loading...</div>
      <div class="astrology-chart-time">loading...</div>
      <div class="astrology-chart-location">
        <span class="astrology-chart-city">loading...</span>
        <span class="astrology-chart-coordinates">loading...</span>
      </div>
    </div>
    <div class="astrology-positions">
      <div class="astrology-position">
        <span class="astrology-position-label">ascendant</span>
        <span class="astrology-position-value">loading...</span>
      </div>
      ${Object.keys(PLANET_SYMBOLS)
        .map(
          (planet) => `
        <div class="astrology-position">
          <span class="astrology-position-label">${planet.toLowerCase()} ${getPlanetSymbol(planet)}</span>
          <span class="astrology-position-value">loading...</span>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}
