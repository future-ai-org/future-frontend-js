import { LOGIA_ADVANCED_CONFIG } from "../config/logiaAdvanced";

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

export interface ChartHashMapping {
  hash: string;
  birthDate: string;
  birthTime: string;
  city: string;
  createdAt: string;
}

export const generateChartHash = (
  birthDate: string,
  birthTime: string,
  city: string,
): string => {
  const data = `${birthDate}-${birthTime}-${city.toLowerCase().trim()}`;
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  let hashString = Math.abs(hash).toString(36);
  
  while (hashString.length < LOGIA_ADVANCED_CONFIG.URL_HASH_LENGTH) {
    const additionalData = `${data}-${hashString}`;
    let additionalHash = 0;
    for (let i = 0; i < additionalData.length; i++) {
      const char = additionalData.charCodeAt(i);
      additionalHash = ((additionalHash << 5) - additionalHash) + char;
      additionalHash = additionalHash & additionalHash;
    }
    hashString += Math.abs(additionalHash).toString(36);
  }
  
  return hashString.substring(0, LOGIA_ADVANCED_CONFIG.URL_HASH_LENGTH);
};

export const storeChartHashMapping = (
  birthDate: string,
  birthTime: string,
  city: string,
): string => {
  const hash = generateChartHash(birthDate, birthTime, city);
  
  if (typeof window !== 'undefined') {
        const mappings = JSON.parse(localStorage.getItem("chartHashMappings") || "[]");
    const existingMapping = mappings.find((m: ChartHashMapping) => m.hash === hash);
    if (!existingMapping) {
      const newMapping: ChartHashMapping = {
        hash,
        birthDate,
        birthTime,
        city,
        createdAt: new Date().toISOString(),
      };
      
      mappings.push(newMapping);
      localStorage.setItem("chartHashMappings", JSON.stringify(mappings));
    }
  }
  
  return hash;
};

export const getBirthDataFromHash = (hash: string): { birthDate: string; birthTime: string; city: string } | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const mappings = JSON.parse(localStorage.getItem("chartHashMappings") || "[]");
  const mapping = mappings.find((m: ChartHashMapping) => m.hash === hash);
  
  if (mapping) {
    return {
      birthDate: mapping.birthDate,
      birthTime: mapping.birthTime,
      city: mapping.city,
    };
  }
  
  const savedCharts = JSON.parse(localStorage.getItem("savedCharts") || "[]");
  const matchingChart = savedCharts.find((chart: BaseSavedChart) => {
    const chartHash = generateChartHash(chart.birthDate, chart.birthTime, chart.city);
    return chartHash === hash;
  });

  if (matchingChart) {
    return {
      birthDate: matchingChart.birthDate,
      birthTime: matchingChart.birthTime,
      city: matchingChart.city,
    };
  }

  return null;
};

export const getDuplicateCharts = <T extends BaseSavedChart>(
  savedCharts: T[],
  chartInfo: ChartIdentifier,
): T[] => {
  if (!Array.isArray(savedCharts) || !chartInfo.birthDate?.trim() || !chartInfo.birthTime?.trim() || !chartInfo.city?.trim() || !chartInfo.name?.trim()) {
    return [];
  }

  const normalizedNew = {
    birthDate: chartInfo.birthDate.trim(),
    birthTime: chartInfo.birthTime.trim(),
    city: chartInfo.city.trim().toLowerCase(),
    name: chartInfo.name.trim().toLowerCase(),
  };

  return savedCharts.filter((savedChart) => {
    const normalizedSaved = {
      birthDate: savedChart.birthDate.trim(),
      birthTime: savedChart.birthTime.trim(),
      city: savedChart.city.trim().toLowerCase(),
      name: savedChart.name.trim().toLowerCase(),
    };
    
    return (
      normalizedNew.birthDate === normalizedSaved.birthDate &&
      normalizedNew.birthTime === normalizedSaved.birthTime &&
      normalizedNew.city === normalizedSaved.city &&
      normalizedNew.name === normalizedSaved.name
    );
  });
};

export const wouldCreateDuplicate = <T extends BaseSavedChart>(
  savedCharts: T[],
  chartInfo: ChartIdentifier,
): boolean => {
  const normalizedNew = {
    birthDate: chartInfo.birthDate.trim(),
    birthTime: chartInfo.birthTime.trim(),
    city: chartInfo.city.trim().toLowerCase(),
    name: chartInfo.name.trim().toLowerCase(),
  };

  return savedCharts.some((savedChart) => {
    const normalizedSaved = {
      birthDate: savedChart.birthDate.trim(),
      birthTime: savedChart.birthTime.trim(),
      city: savedChart.city.trim().toLowerCase(),
      name: savedChart.name.trim().toLowerCase(),
    };
    return (
      normalizedNew.birthDate === normalizedSaved.birthDate &&
      normalizedNew.birthTime === normalizedSaved.birthTime &&
      normalizedNew.city === normalizedSaved.city &&
      normalizedNew.name === normalizedSaved.name
    );
  });
};
