import { ChartData } from "../config/logiaChart";

export interface SavedChart {
  id: string;
  birthDate: string;
  birthTime: string;
  city: string;
  chartData: ChartData;
  savedAt: string;
  name: string;
}
