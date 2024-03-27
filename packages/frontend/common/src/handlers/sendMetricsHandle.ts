import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import { TSocketURL } from '../types/domain/sockets';
import { isProduction } from '../utils/environment';

export type TSendBody = {
    type: 'PublishMetrics';
    metrics: TMetric[];
};

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

export function sendMetricsHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    metrics: TMetric[],
    options?: THandlerOptions,
) {
    if (!isProduction()) return;

    fetch<TSendBody, {}>(
        url,
        {
            type: 'PublishMetrics',
            metrics,
        },
        {
            ...options,
            enableLogs: false,
            waitForResponse: false,
            skipAuthentication: true,
        },
    ).subscribe();
}
