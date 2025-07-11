import { ChartData, HOUSE_ANGLES, ZODIAC_SYMBOLS } from "../config/logiaChart";
import * as d3 from "d3";
import chartStrings from "../i18n/logiaChart.json";

export const ZODIAC_ORDER = [
  ZODIAC_SYMBOLS.pisces,
  ZODIAC_SYMBOLS.aquarius,
  ZODIAC_SYMBOLS.capricorn,
  ZODIAC_SYMBOLS.sagittarius,
  ZODIAC_SYMBOLS.scorpio,
  ZODIAC_SYMBOLS.libra,
  ZODIAC_SYMBOLS.virgo,
  ZODIAC_SYMBOLS.leo,
  ZODIAC_SYMBOLS.cancer,
  ZODIAC_SYMBOLS.gemini,
  ZODIAC_SYMBOLS.taurus,
  ZODIAC_SYMBOLS.aries,
];

type ZodiacSign = keyof typeof chartStrings.en.signs;
type PlanetData = {
  name: string;
  position: number;
};

export let orderedSigns: Map<string, { planets: PlanetData[] }> = new Map();

export function updateOrderedSigns(
  ascendantSign: string,
  chartData: ChartData,
) {
  const zodiacSigns = chartStrings.en.zodiacSigns;
  const ascendantIndex = zodiacSigns.findIndex(
    (sign) => sign.toLowerCase() === ascendantSign.toLowerCase(),
  );
  const orderedArray = [
    ...zodiacSigns.slice(ascendantIndex),
    ...zodiacSigns.slice(0, ascendantIndex),
  ];
  orderedSigns = new Map();
  orderedArray.forEach((sign) => {
    const planetsInSign = chartData.planets.filter(
      (p) => p.sign.toLowerCase() === sign.toLowerCase(),
    );
    orderedSigns.set(sign, {
      planets: planetsInSign.map((p) => ({
        name: p.name,
        position: p.position,
      })),
    });
  });
}

export function drawZodiacSymbols(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
) {
  const zodiacRadius = radius + 15;
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip tooltip-large");

  const orderedArray = Array.from(orderedSigns.keys());
  const zodiacSigns = chartStrings.en.zodiacSigns;
  for (let index = 0; index < 12; index++) {
    const houseAngle = HOUSE_ANGLES[index];
    const middleAngle = ((houseAngle + 15) * Math.PI) / 180;
    const x = zodiacRadius * Math.cos(middleAngle);
    const y = zodiacRadius * Math.sin(middleAngle);
    const signName = orderedArray[index].toLowerCase() as ZodiacSign;
    const signSymbol = ZODIAC_ORDER[zodiacSigns.indexOf(orderedArray[index])];

    g.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("class", "zodiac-symbol")
      .text(signSymbol)
      .on("mouseover", function (event) {
        const signDescription = chartStrings.en.signs[signName];

        tooltip
          .style("visibility", "visible")
          .style("opacity", "1")
          .html(
            `<strong>${orderedArray[index]}</strong><p>${signDescription}</p>`,
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden").style("opacity", "0");
      });
  }
}

export function drawPlanets(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  onPlanetClick: (planetName: string) => void,
  getPlanetSymbol: (name: string) => string,
  chartData: ChartData,
) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip tooltip-quick");

  const orderedArray = Array.from(orderedSigns.keys());

  HOUSE_ANGLES.forEach((houseAngle, index) => {
    const sign = orderedArray[index];
    const signData = orderedSigns.get(sign);
    if (!signData) return;

    const middleAngle = ((houseAngle + 15) * Math.PI) / 180;

    const sortedPlanets = [...signData.planets].sort((a, b) => {
      const aPos = (a.position - houseAngle + 360) % 360;
      const bPos = (b.position - houseAngle + 360) % 360;
      return bPos - aPos;
    });
    const planetsInSign = sortedPlanets.length;

    const angleSpread = Math.min(24, planetsInSign * 5);

    sortedPlanets.forEach((planet, planetIndex) => {
      const angleStep = angleSpread / (planetsInSign - 1 || 1);
      const offset = (planetIndex - (planetsInSign - 1) / 2) * angleStep;
      const angle = middleAngle + (offset * Math.PI) / 180;

      const x = (radius - 45) * Math.cos(angle);
      const y = (radius - 45) * Math.sin(angle);

      const planetGroup = g
        .append("g")
        .attr("transform", `translate(${x},${y})`)
        .attr("class", "planet-group")
        .on("click", () => onPlanetClick(planet.name))
        .on("mouseover", function (event) {
          tooltip
            .style("visibility", "visible")
            .style("opacity", "1")
            .html(
              `${planet.name} ${chartStrings.en.points.tooltip
                .replace("{sign}", sign)
                .replace("{position}", planet.position.toFixed(2))}`,
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden").style("opacity", "0");
        });

      planetGroup
        .append("circle")
        .attr("r", 12)
        .attr("class", "planet-background");

      planetGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(getPlanetSymbol(planet.name))
        .attr("class", "planet-text");
    });
  });

  const ascendantAngle = ((360 - chartData.houses[0] + 180) * Math.PI) / 180;
  const ascX = radius * Math.cos(ascendantAngle);
  const ascY = radius * Math.sin(ascendantAngle);

  const ascGroup = g
    .append("g")
    .attr("transform", `translate(${ascX},${ascY})`)
    .attr("class", "planet-group")
    .on("mouseover", function (event) {
      tooltip
        .style("visibility", "visible")
        .style("opacity", "1")
        .html(
          `${chartStrings.en.points.ascendant} ${chartStrings.en.points.tooltip
            .replace("{sign}", chartData.ascendantSign.toLowerCase())
            .replace("{position}", chartData.houses[0].toFixed(2))}`,
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden").style("opacity", "0");
    });

  ascGroup
    .append("circle")
    .attr("r", 12)
    .attr("class", "planet-background ascendant-background");

  ascGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "14px")
    .text(chartStrings.en.points.ascendantEmoji)
    .attr("class", "planet-text ascendant-text");
}

export function calculateHouses(ascendantDegrees: number): number[] {
  return Array.from(
    { length: 12 },
    (_, i) => (ascendantDegrees + i * 30) % 360,
  );
}
