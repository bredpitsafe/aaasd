export type TMetric = {
    name: string;
    value: TMetricValue;
    labels: [string, string][];
};

export type TMetricValue =
    | {
          kind: 'Counter';
          value: number;
      }
    | {
          kind: 'Gauge';
          value: number;
      }
    | {
          kind: 'Summary';
          sum: number;
          count: number;
          quantiles: [number, number][];
      };
