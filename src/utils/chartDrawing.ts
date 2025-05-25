import * as d3 from "d3";
import chartStrings from "../i18n/logiaChart.json";
import { HOUSE_ANGLES } from "../config/logiaChart";

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
      .attr("class", `tooltip tooltip-${type}`);
  } else if (globalTooltip.attr("class") !== `tooltip tooltip-${type}`) {
    globalTooltip.attr("class", `tooltip tooltip-${type}`);
  }
  return globalTooltip;
}

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
  g.append("circle").attr("r", radius).attr("class", "chart-circle");

  g.append("circle")
    .attr("r", radius * 0.2)
    .attr("class", "chart-circle-inner");

  g.append("circle")
    .attr("r", radius * 0.1)
    .attr("class", "chart-circle-center");

  g.append("circle")
    .attr("r", radius + 30)
    .attr("class", "chart-circle-outer");
}

export function drawHouseLines(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
) {
  HOUSE_ANGLES.forEach((angle) => {
    const angleRad = (angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const x = radius * cos;
    const y = radius * sin;
    const innerX = radius * 0.1 * cos;
    const innerY = radius * 0.1 * sin;

    g.append("line")
      .attr("x1", innerX)
      .attr("y1", innerY)
      .attr("x2", x)
      .attr("y2", y)
      .attr("class", "house-line");
  });
}

export function drawHouseNumbers(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  radius: number,
) {
  const tooltip = getGlobalTooltip("large");
  const tooltipContent = new Map<number, string>();

  // Pre-compute tooltip content
  HOUSE_ANGLES.forEach((_, i) => {
    const houseNumber = (i + 1).toString() as keyof typeof chartStrings.en.houses;
    const houseDescription = chartStrings.en.houses[houseNumber];
    tooltipContent.set(i + 1, `<strong>${chartStrings.en.table.house} ${houseNumber}</strong><p>${houseDescription}</p>`);
  });

  HOUSE_ANGLES.forEach((angle, i) => {
    const labelAngle = ((angle + 15) * Math.PI) / 180;
    const x = radius * 0.15 * Math.cos(labelAngle);
    const y = radius * 0.15 * Math.sin(labelAngle);

    g.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("class", "house-number")
      .text((i + 1).toString())
      .on("mouseover", function (event) {
        tooltip
          .style("visibility", "visible")
          .style("opacity", "1")
          .html(tooltipContent.get(i + 1) || "")
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
  });
}
