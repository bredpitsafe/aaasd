import { getMetricFunctions } from '@backend/utils/src/metrics.ts';
import { collectDefaultMetrics, Counter, Gauge, Summary } from 'prom-client';

import { EMetricsLabel } from './def.ts';

// Send some default NodeJS metrics to Prometheus
collectDefaultMetrics();

const { counter, gauge, summary } = getMetricFunctions(Counter, Gauge, Summary);

const errorMetric = counter('rpc_call_errors_total', 'Total rpc call errors', [
    EMetricsLabel.RpcName,
    EMetricsLabel.ErrorType,
    EMetricsLabel.ErrorMessage,
]);

const createErrorMetricByType = (errorType: string) =>
    ({
        ...errorMetric,
        inc: (labels: Record<EMetricsLabel, string>) =>
            errorMetric.inc({ ...labels, [EMetricsLabel.ErrorType]: errorType }),
    }) as typeof errorMetric;

export const metrics = {
    rpcCall: {
        incoming: counter('incoming_rpc_calls_total', 'Incoming rpc calls', [
            EMetricsLabel.RpcName,
        ]),
        outgoing: counter('outgoing_rpc_calls_total', 'Outgoing rpc calls', [
            EMetricsLabel.RpcName,
        ]),
        responseDuration: summary(
            'rpc_call_response_duration_seconds',
            'RPC call response duration in seconds',
            [EMetricsLabel.RpcName],
        ),
        rpcError: createErrorMetricByType('rpc_error'),
        subscriptionError: createErrorMetricByType('subscription_error'),
    },
    subscriptions: {
        active: gauge('active_subscriptions', 'Current active subscriptions count'),
        total: counter('subscriptions_total', 'Total subscriptions opened since server startup'),
    },
};
