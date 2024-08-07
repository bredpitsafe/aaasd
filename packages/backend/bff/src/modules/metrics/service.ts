import { getCommonSocketMetrics, getMetricFunctions } from '@backend/utils/src/metrics.ts';
import { collectDefaultMetrics, Counter, Gauge, Summary } from 'prom-client';

import { EMetricsLabels } from './def.ts';

// Send some default NodeJS metrics to Prometheus
collectDefaultMetrics();

const { counter, gauge, summary } = getMetricFunctions(Counter, Gauge, Summary);

export const metrics = {
    ...getCommonSocketMetrics({ counter, gauge }),
    messages: {
        incoming: counter(
            'ws_incoming_messages_total',
            'Total messages received since server startup',
            [EMetricsLabels.Type, EMetricsLabels.Stage],
        ),
        outgoing: counter(
            'ws_outgoing_messages_total',
            'Total messages sent since server startup',
            [EMetricsLabels.Type, EMetricsLabels.Stage],
        ),
        firstResponseDuration: summary(
            'ws_first_response_duration_seconds',
            'First response processing duration in seconds',
            [EMetricsLabels.Type, EMetricsLabels.Stage],
        ),
    },
};
