import {
  ZODIAC_SIGNS,
  ASPECTS,
  ChartData,
  PlanetPosition,
  Aspect,
} from './logia';

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
export function getJulianDay(date: Date): number {
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

export function calculateSiderealTime(julianDay: number, longitude: number): number {
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

export function calculateAscendant(
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

  // ... rest of the planet position calculations ...
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