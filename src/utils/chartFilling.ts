import {
  ChartData,
  ZODIAC_SIGNS,
  HOUSE_ANGLES,
  ZODIAC_SYMBOLS,
} from "../config/logiaChart";
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

let orderedSigns: Map<string, { planets: PlanetData[] }> = new Map();

export function updateOrderedSigns(
  ascendantSign: string,
  chartData: ChartData,
) {
  const ascendantIndex = ZODIAC_SIGNS.findIndex(
    (sign) => sign.toLowerCase() === ascendantSign.toLowerCase(),
  );
  const orderedArray = [
    ...ZODIAC_SIGNS.slice(ascendantIndex),
    ...ZODIAC_SIGNS.slice(0, ascendantIndex),
  ];

  // Create a new Map with the ordered signs and fill it with chart data
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

export function drawAscendant(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  chartData: ChartData,
) {
  const ascendantAngle = ((360 - chartData.houses[0] + 180) * Math.PI) / 180;
  const ascX = (radius - 35) * Math.cos(ascendantAngle);
  const ascY = (radius - 35) * Math.sin(ascendantAngle);
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip tooltip-quick");

  const ascGroup = g
    .append("g")
    .attr("transform", `translate(${ascX},${ascY})`)
    .attr("class", "planet-group")
    .on("mouseover", function (event) {
      tooltip
        .style("visibility", "visible")
        .style("opacity", "1")
        .html(
          `${chartStrings.en.points.ascendant} ${chartStrings.en.points.tooltip.replace("{sign}", chartData.ascendantSign.toLowerCase()).replace("{position}", chartData.houses[0].toFixed(2))}`,
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

  ascGroup.append("circle").attr("r", 12).attr("class", "planet-background");

  ascGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "14px")
    .text(chartStrings.en.points.ascendantEmoji)
    .attr("class", "planet-text");
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
  for (let index = 0; index < 12; index++) {
    const houseAngle = HOUSE_ANGLES[index];
    const middleAngle = ((houseAngle + 15) * Math.PI) / 180;
    const x = zodiacRadius * Math.cos(middleAngle);
    const y = zodiacRadius * Math.sin(middleAngle);

    const signName = orderedArray[index].toLowerCase() as ZodiacSign;
    const signSymbol = ZODIAC_ORDER[ZODIAC_SIGNS.indexOf(orderedArray[index])];

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
) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip tooltip-quick");

  const orderedArray = Array.from(orderedSigns.keys());

  // Loop through each house and draw planets in that sign
  HOUSE_ANGLES.forEach((houseAngle, index) => {
    const sign = orderedArray[index];
    const signData = orderedSigns.get(sign);
    if (!signData) return;

    // Calculate the middle angle of the house
    const middleAngle = ((houseAngle + 15) * Math.PI) / 180;
    
    // Draw each planet in this sign
    signData.planets.forEach((planet, planetIndex) => {
      // Offset planets within the same sign
      const planetOffset = (planetIndex - (signData.planets.length - 1) / 2) * 10;
      const angle = middleAngle + (planetOffset * Math.PI) / 180;
      
      const x = (radius - 35) * Math.cos(angle);
      const y = (radius - 35) * Math.sin(angle);

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
              `${planet.name} ${chartStrings.en.planetTooltip
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
}

export function calculateAspects(
  planets: { name: string; position: number }[],
) {
  const aspects = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const angle = Math.abs(planets[i].position - planets[j].position);
      const normalizedAngle = Math.min(angle, 360 - angle);

      // Define aspect orbs (you may want to adjust these values)
      const aspectOrbs = {
        conjunction: 8,
        opposition: 8,
        trine: 8,
        square: 8,
        sextile: 6,
      };

      // Check for aspects
      if (normalizedAngle <= aspectOrbs.conjunction) {
        aspects.push({
          planet1: planets[i].name,
          planet2: planets[j].name,
          type: "conjunction",
          orb: normalizedAngle,
        });
      } else if (Math.abs(normalizedAngle - 180) <= aspectOrbs.opposition) {
        aspects.push({
          planet1: planets[i].name,
          planet2: planets[j].name,
          type: "opposition",
          orb: Math.abs(normalizedAngle - 180),
        });
      } else if (Math.abs(normalizedAngle - 120) <= aspectOrbs.trine) {
        aspects.push({
          planet1: planets[i].name,
          planet2: planets[j].name,
          type: "trine",
          orb: Math.abs(normalizedAngle - 120),
        });
      } else if (Math.abs(normalizedAngle - 90) <= aspectOrbs.square) {
        aspects.push({
          planet1: planets[i].name,
          planet2: planets[j].name,
          type: "square",
          orb: Math.abs(normalizedAngle - 90),
        });
      } else if (Math.abs(normalizedAngle - 60) <= aspectOrbs.sextile) {
        aspects.push({
          planet1: planets[i].name,
          planet2: planets[j].name,
          type: "sextile",
          orb: Math.abs(normalizedAngle - 60),
        });
      }
    }
  }
  return aspects;
}

export function calculateHouses(ascendantDegrees: number): number[] {
  return Array.from(
    { length: 12 },
    (_, i) => (ascendantDegrees + i * 30) % 360,
  );
}

export function drawAspects(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  chartData: ChartData,
) {
  chartData.aspects.forEach((aspect) => {
    const planet1 = chartData.planets.find((p) => p.name === aspect.planet1);
    const planet2 = chartData.planets.find((p) => p.name === aspect.planet2);

    if (planet1 && planet2) {
      const x1 =
        (radius - 35) * Math.cos(((planet1.position - 90) * Math.PI) / 180);
      const y1 =
        (radius - 35) * Math.sin(((planet1.position - 90) * Math.PI) / 180);
      const x2 =
        (radius - 35) * Math.cos(((planet2.position - 90) * Math.PI) / 180);
      const y2 =
        (radius - 35) * Math.sin(((planet2.position - 90) * Math.PI) / 180);

      // Calculate the angle difference
      let angleDiff = Math.abs(planet1.position - planet2.position);
      if (angleDiff > 180) {
        angleDiff = 360 - angleDiff;
      }

      // Determine aspect type and class
      let aspectClass = "aspect-line";
      if (Math.abs(angleDiff - 180) < 1) {
        aspectClass = "aspect-opposition";
      } else if (Math.abs(angleDiff - 90) < 1) {
        aspectClass = "aspect-square";
      } else if (Math.abs(angleDiff - 120) < 1) {
        aspectClass = "aspect-trine";
      } else if (Math.abs(angleDiff - 60) < 1) {
        aspectClass = "aspect-sextile";
      } else if (Math.abs(angleDiff - 72) < 1) {
        aspectClass = "aspect-quintile";
      }

      g.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("class", aspectClass);
    }
  });
}
