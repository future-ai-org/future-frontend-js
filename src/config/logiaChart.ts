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

export const ASTROLOGY_EFFECTS = [
  "neutral",
  "expand",
  "expand",
  "expand",
  "neutral",
  "contract",
  "contract",
  "contract",
  "contract",
  "contract",
  "contract",
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

export const ASPECTS = [
  { name: "conjunction", degrees: 0, orb: 8 },
  { name: "sextile", degrees: 60, orb: 8 },
  { name: "square", degrees: 90, orb: 8 },
  { name: "trine", degrees: 120, orb: 8 },
  { name: "opposition", degrees: 180, orb: 8 },
] as const;

export const ELEMENTS = {
  FIRE: "🜂",
  EARTH: "🜃",
  AIR: "🜁",
  WATER: "🜄",
} as const;

export type Element = (typeof ELEMENTS)[keyof typeof ELEMENTS];
export type PlanetName = keyof typeof PLANET_SYMBOLS;
export type ZodiacSign = keyof typeof ZODIAC_SYMBOLS;

export function getPlanetSymbol(planetName: string): string {
  return (
    PLANET_SYMBOLS[planetName as keyof typeof PLANET_SYMBOLS] || planetName
  );
}

export function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign.toLowerCase() as keyof typeof ZODIAC_SYMBOLS] || sign;
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

export function printChartInfo(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  city: string,
  t: {
    table: {
      planet: string;
      angle: string;
      sign: string;
      house: string;
      effects: string;
      element: string;
    };
  },
): string {
  const chart = calculateChart(birthDate, birthTime, latitude, longitude);
  const date = new Date(`${birthDate}T${birthTime}`);
  const formattedDate = date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-us", {
    hour: "2-digit",
    minute: "2-digit",
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

  const planetTable = `
    <table class="astrology-table">
      <thead>
        <tr>
          <th>${t.table.planet.toLowerCase()}</th>
          <th>${t.table.angle.toLowerCase()}</th>
          <th>${t.table.sign.toLowerCase()}</th>
          <th>${t.table.element.toLowerCase()}</th>
          <th>${t.table.house.toLowerCase()}</th>
          <th>${t.table.effects.toLowerCase()}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>ASC</td>
          <td>${ascendantDegree.toFixed(2)}°</td>
          <td>${getZodiacSymbol(ascendantSign)}</td>
          <td>${getElementForSign(ascendantSign)}</td>
          <td>1</td>
          <td>${ASTROLOGY_EFFECTS[0]}</td>
        </tr>
        ${chart.planets
          .map(
            (planet, index) => `
        <tr>
          <td>${getPlanetSymbol(planet.name)}</td>
          <td>${(planet.position % 30).toFixed(2)}°</td>
          <td>${getZodiacSymbol(planet.sign)}</td>
          <td>${getElementForSign(planet.sign)}</td>
          <td>${planet.house}</td>
          <td>${ASTROLOGY_EFFECTS[index + 1]}</td>
        </tr>
      `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  return `
    <div class="astrology-chart-header">
      <div class="astrology-chart-date">${formattedDate.toLowerCase()}</div>
      <div class="astrology-chart-time">${formattedTime.toLowerCase()}<span class="at-text"> at </span>${city.toLowerCase()}</div>
    </div>
    ${planetTable}
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
    position: planet.position,
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
export function getJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  return jdn + (hour - 12) / 24;
}

export function calculateSiderealTime(
  julianDay: number,
  longitude: number,
): number {
  const T = (julianDay - 2451545.0) / 36525;
  let theta =
    280.46061837 +
    360.98564736629 * (julianDay - 2451545.0) +
    T * T * (0.000387933 - T / 38710000);

  theta = (theta + longitude) % 360;
  return theta < 0 ? theta + 360 : theta;
}

export function calculateAscendant(
  siderealTime: number,
  latitude: number,
  julianDay: number,
): number {
  const T = (siderealTime * Math.PI) / 180;
  const lat = (latitude * Math.PI) / 180;

  const T_centuries = (julianDay - 2451545.0) / 36525;
  const epsilon =
    ((23.4392911 -
      0.0130042 * T_centuries -
      0.00000016 * T_centuries * T_centuries +
      0.000000504 * T_centuries * T_centuries * T_centuries) *
      Math.PI) /
    180;

  const tanAsc =
    (Math.cos(T) * Math.sin(epsilon) + Math.tan(lat) * Math.cos(epsilon)) /
    Math.sin(T);
  let ascendant = (Math.atan(tanAsc) * 180) / Math.PI;

  if (Math.sin(T) < 0) {
    ascendant += 180;
  }

  return (360 - ascendant) % 360;
}

function calculatePlanetPosition(
  planet: string,
  julianDay: number,
): PlanetPosition {
  if (planet === "sun") {
    const T = (julianDay - 2451545.0) / 36525;
    const _L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) *
        Math.sin((M * Math.PI) / 180) +
      (0.019993 - 0.000101 * T) * Math.sin((2 * M * Math.PI) / 180) +
      0.000289 * Math.sin((3 * M * Math.PI) / 180);
    const trueLongitude = _L0 + C;
    let position = trueLongitude % 360;
    if (position < 0) position += 360;

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
  return Array.from({ length: 12 }, (_, i) => (ascendant + i * 30) % 360);
}
