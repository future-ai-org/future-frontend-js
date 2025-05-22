import { ChartData, ZODIAC_SIGNS } from "../config/logiaChart";
import * as d3 from "d3";
import chartStrings from "../i18n/logiaChart.json";

type ZodiacSign = keyof typeof chartStrings.en.signs;

export interface ChartDimensions {
  width: number;
  height: number;
  size: number;
  radius: number;
}

export function calculateChartDimensions(
  container: HTMLElement,
): ChartDimensions {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const size = Math.min(width, height);
  const radius = size / 2 - 40;
  return { width, height, size, radius };
}

export function createBaseChart(
  container: HTMLElement,
  dimensions: ChartDimensions,
) {
  d3.select(container).selectAll("*").remove();
  const { width, height } = dimensions;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("class", "chart-svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svg
    .append("g")
    .attr("class", "chart-group")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  return { svg, g };
}

export function drawChartCircles(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
) {
  g.append("circle")
    .attr("r", radius)
    .attr("class", "chart-circle");

  g.append("circle")
    .attr("r", radius + 30)
    .attr("class", "chart-circle-outer");
}

export function drawHouseNumbers(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  ascendantAngle: number,
) {
  const houseNumberRadius = radius * 0.2;

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip");

  for (let i = 0; i < 12; i++) {
    const angle =
      ((((ascendantAngle - i * 30 + 360) % 360) - 90 + 15) * Math.PI) / 180;
    const x = houseNumberRadius * Math.cos(angle);
    const y = houseNumberRadius * Math.sin(angle);

    g.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", "0.35em")
      .attr("class", "house-number")
      .text((i + 1).toString())
      .on("mouseover", function (event) {
        const houseNumber = (i + 1).toString() as keyof typeof chartStrings.en.houses;
        const houseDescription = chartStrings.en.houses[houseNumber];
        
        tooltip
          .classed("visible", true)
          .text(`house ${houseNumber}\n\n${houseDescription}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        tooltip
          .classed("visible", false);
      });
  }
}

export function drawAscendant(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  ascendantAngle: number,
) {
  const ascX =
    (radius - 35) * Math.cos(((ascendantAngle - 90) * Math.PI) / 180);
  const ascY =
    (radius - 35) * Math.sin(((ascendantAngle - 90) * Math.PI) / 180);

  const ascGroup = g
    .append("g")
    .attr("transform", `translate(${ascX},${ascY})`);

  ascGroup
    .append("circle")
    .attr("r", 8)
    .attr("class", "ascendant-circle");

  ascGroup
    .append("text")
    .attr("x", 12)
    .attr("y", 5)
    .text("ASC")
    .attr("class", "ascendant-text");
}

export function drawZodiacSymbols(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  zodiacSymbols: string[],
) {
  const zodiacRadius = radius + 15;
  const zodiacNames = ZODIAC_SIGNS.map(sign => sign.charAt(0) + sign.slice(1));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip");

  for (let index = 0; index < 12; index++) {
    const angle = ((index * 30 - 90 + 15) * Math.PI) / 180;
    const x = zodiacRadius * Math.cos(angle);
    const y = zodiacRadius * Math.sin(angle);

    g.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("class", "zodiac-symbol")
      .text(zodiacSymbols[index])
      .on("mouseover", function (event) {
        const signName = zodiacNames[index].toLowerCase() as ZodiacSign;
        const signDescription = chartStrings.en.signs[signName];
        
        tooltip
          .classed("visible", true)
          .html(`<strong>${zodiacNames[index]}</strong>\n\n${signDescription}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        tooltip
          .classed("visible", false);
      });
  }
}

export function drawHouses(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  houses: number[],
) {
  houses.forEach((angle) => {
    const x = radius * Math.cos(((angle - 90) * Math.PI) / 180);
    const y = radius * Math.sin(((angle - 90) * Math.PI) / 180);

    g.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("class", "house-line");
  });
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

      g.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("class", "aspect-line");
    }
  });
}

export function drawPlanets(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  chartData: ChartData,
  onPlanetClick: (planetName: string) => void,
  getPlanetSymbol: (name: string) => string,
) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip");

  chartData.planets.forEach((planet) => {
    const x =
      (radius - 35) * Math.cos(((planet.position - 90) * Math.PI) / 180);
    const y =
      (radius - 35) * Math.sin(((planet.position - 90) * Math.PI) / 180);

    const planetGroup = g
      .append("g")
      .attr("transform", `translate(${x},${y})`)
      .on("click", () => onPlanetClick(planet.name))
      .on("mouseover", function (event) {
        tooltip
          .classed("visible", true)
          .html(`<strong>${planet.name}</strong>\n\nIn ${planet.sign} (${planet.position.toFixed(1)}°)`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        tooltip
          .classed("visible", false);
      });

    planetGroup
      .append("circle")
      .attr("r", 8)
      .attr("class", "planet-circle");

    planetGroup
      .append("text")
      .attr("x", 12)
      .attr("y", 5)
      .text(getPlanetSymbol(planet.name))
      .attr("class", "planet-text");
  });
}
