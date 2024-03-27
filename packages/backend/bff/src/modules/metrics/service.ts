import {
    getCommonSocketMetrics,
    getDefaultLabels,
    getMetricFunctions,
} from '@backend/utils/src/metrics.ts';
import { collectDefaultMetrics } from 'prom-client';

import { appConfig } from '../../utils/appConfig.ts';
import { EMetricsLabels } from './def.ts';

// Send some default NodeJS metrics to Prometheus
const defaultLabels = getDefaultLabels(appConfig.metrics.labels);

collectDefaultMetrics({
    prefix: appConfig.metrics.prefix,
    labels: defaultLabels,
});

const metricsFunctions = getMetricFunctions(appConfig.metrics);
const { counter, gauge, summary } = metricsFunctions;

export const metrics = {
    ...getCommonSocketMetrics(metricsFunctions),
    messages: {
        total: counter('messsages_total', 'Total messages received since server startup', [
            EMetricsLabels.Type,
        ]),
        errors: counter('messages_errors_total', 'Errored messages', [
            EMetricsLabels.Type,
            EMetricsLabels.ErrorCode,
        ]),
        actorErrors: counter('messages_actors_errors', 'Errors from actors (expected errors)', [
            EMetricsLabels.Type,
            EMetricsLabels.ErrorCode,
        ]),
        unspecifiedErrors: counter(
            'messages_unspecified_errors',
            'Unspecified errors (unexpected errors)',
            [EMetricsLabels.Type, EMetricsLabels.Value],
        ),
        responseDuration: summary('messages', 'Response processing duration', [
            EMetricsLabels.Type,
        ]),
    },
    subscriptions: {
        active: gauge('subscriptions_active', 'Current active subscriptions', [
            EMetricsLabels.Type,
        ]),
    },
};
