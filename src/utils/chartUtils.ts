export interface ChartIdentifier {
  birthDate: string;
  birthTime: string;
  city: string;
  name: string;
}

export interface BaseSavedChart {
  id: string;
  birthDate: string;
  birthTime: string;
  city: string;
  name: string;
}

/**
 * Validate chart identifier fields
 */
export const validateChartIdentifier = (
  chartInfo: ChartIdentifier,
): boolean => {
  return !!(
    chartInfo.birthDate?.trim() &&
    chartInfo.birthTime?.trim() &&
    chartInfo.city?.trim() &&
    chartInfo.name?.trim()
  );
};

/**
 * Normalize chart identifier fields for consistent comparison
 */
export const normalizeChartIdentifier = (
  chartInfo: ChartIdentifier,
): ChartIdentifier => {
  return {
    birthDate: chartInfo.birthDate.trim(),
    birthTime: chartInfo.birthTime.trim(),
    city: chartInfo.city.trim().toLowerCase(),
    name: chartInfo.name.trim().toLowerCase(),
  };
};

/**
 * Check if two charts are duplicates based on their identifying information
 * Uses case-insensitive comparison for city and name to handle variations
 */
export const isChartDuplicate = (
  chart1: BaseSavedChart,
  chart2: ChartIdentifier,
): boolean => {
  // Validate inputs
  if (!validateChartIdentifier(chart2)) {
    return false;
  }

  const normalized1 = normalizeChartIdentifier({
    birthDate: chart1.birthDate,
    birthTime: chart1.birthTime,
    city: chart1.city,
    name: chart1.name,
  });

  const normalized2 = normalizeChartIdentifier(chart2);

  return (
    normalized1.birthDate === normalized2.birthDate &&
    normalized1.birthTime === normalized2.birthTime &&
    normalized1.city === normalized2.city &&
    normalized1.name === normalized2.name
  );
};

/**
 * Check if a chart with the given identifying information already exists in the saved charts
 */
export const findDuplicateChart = <T extends BaseSavedChart>(
  savedCharts: T[],
  chartInfo: ChartIdentifier,
): T | undefined => {
  if (!Array.isArray(savedCharts) || !validateChartIdentifier(chartInfo)) {
    return undefined;
  }

  return savedCharts.find((savedChart) =>
    isChartDuplicate(savedChart, chartInfo),
  );
};

/**
 * Get all duplicate charts for a given chart identifier
 */
export const getDuplicateCharts = <T extends BaseSavedChart>(
  savedCharts: T[],
  chartInfo: ChartIdentifier,
): T[] => {
  if (!Array.isArray(savedCharts) || !validateChartIdentifier(chartInfo)) {
    return [];
  }

  return savedCharts.filter((savedChart) =>
    isChartDuplicate(savedChart, chartInfo),
  );
};

/**
 * Check if saving a chart would create a duplicate
 */
export const wouldCreateDuplicate = <T extends BaseSavedChart>(
  savedCharts: T[],
  chartInfo: ChartIdentifier,
): boolean => {
  return findDuplicateChart(savedCharts, chartInfo) !== undefined;
};
