declare module "chartiq" {
  export namespace CIQ {
    export class ChartEngine {
      constructor(config: {
        container: HTMLElement;
        layout: {
          chartType: string;
          periodicity: number;
          interval: string;
          timeUnit: string;
          timeSpan: number;
        };
      });

      setStyle(styleName: string, style: { color: string }): void;
      loadChart(
        symbol: string,
        data: {
          masterData: Array<{
            Date: string;
            Open: number;
            High: number;
            Low: number;
            Close: number;
          }>;
        },
      ): void;
      destroy(): void;
    }
  }

  export const CIQ: typeof CIQ;
}
