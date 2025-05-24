import { ChartData, ZODIAC_SIGNS } from "../config/logiaChart";
import * as d3 from "d3";
import chartStrings from "../i18n/logiaChart.json";

type ZodiacSign = keyof typeof chartStrings.en.signs;

let globalTooltip: d3.Selection<
  HTMLDivElement,
  unknown,
  HTMLElement,
  unknown
> | null = null;

function getGlobalTooltip(
  type: "large" | "quick" = "quick",
): d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown> {
  if (!globalTooltip) {
    globalTooltip = d3
      .select("body")
      .append("div")
      .attr("class", `tooltip tooltip-${type}`)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("opacity", "0");
  } else {
    globalTooltip.attr("class", `tooltip tooltip-${type}`);
  }
  return globalTooltip;
}

export function drawAscendant(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
  chartData: ChartData,
) {
  const ascendantAngle = ((360 - chartData.houses[0] + 180) * Math.PI) / 180;
  const ascX = (radius - 35) * Math.cos(ascendantAngle);
  const ascY = (radius - 35) * Math.sin(ascendantAngle);
  const tooltip = getGlobalTooltip("quick");

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
  zodiacSymbols: string[],
) {
  const zodiacRadius = radius + 15;
  const zodiacNames = ZODIAC_SIGNS.map(
    (sign) => sign.charAt(0) + sign.slice(1),
  );
  const tooltip = getGlobalTooltip("large");

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
          .style("visibility", "visible")
          .style("opacity", "1")
          .html(
            `<strong>${zodiacNames[index]}</strong><p>${signDescription}</p>`,
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
  chartData: ChartData,
  onPlanetClick: (planetName: string) => void,
  getPlanetSymbol: (name: string) => string,
) {
  const tooltip = getGlobalTooltip("quick");

  chartData.planets.forEach((planet) => {
    const angle = ((planet.position - 90) * Math.PI) / 180;

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
            `${planet.name} ${chartStrings.en.planetTooltip.replace("{sign}", planet.sign).replace("{position}", planet.position.toFixed(2))}`,
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
