import { fromPairs } from 'lodash-es';
import { collectDefaultMetrics, Counter, Gauge, MetricConfiguration, Summary } from 'prom-client';

import { appConfig } from '../../utils/appConfig.ts';
import { EMetricsLabels } from './def.ts';

// Send some default NodeJS metrics to Prometheus
const defaultLabels = fromPairs(appConfig.metrics.labels);

collectDefaultMetrics({
    prefix: appConfig.metrics.prefix,
    labels: defaultLabels,
});

function metric<T = Counter | Gauge | Summary>(
    MetricClass: new (config: MetricConfiguration<string>) => T,
): (metricName: string, helpText?: string, labels?: EMetricsLabels[]) => T {
    return (metricName, helpText, labels = [] as EMetricsLabels[]) => {
        return new MetricClass({
            name: `${appConfig.metrics.prefix}${metricName}`,
            help: helpText ?? metricName,
            labelNames: Object.keys(defaultLabels).concat(labels),
        });
    };
}

const counter = metric(Counter);
const gauge = metric(Gauge);
const summary = metric(Summary);

export const metrics = {
    socket: {
        total: counter('sockets_total', 'Total sockets opened since server startup'),
        active: gauge('sockets_active', 'Current opened sockets'),
        schemaValidationErrors: counter(
            'sockets_schema_validation_errors',
            'Schema validation errors',
        ),
        notAuthenticatedErrors: counter(
            'sockets_schema_not_authenticated_errors',
            'Socket authentication errors',
        ),
        parseMessageErrors: counter(
            'sockets_parse_errors',
            'Parse incoming message to JSON errors',
        ),
        internalErrors: counter('sockets_internal_errors', 'Server internal errors'),
    },
    authentication: {
        authenticatedSockets: gauge(
            'authentication_authenticated_sockets',
            'Current number of authenticated sockets',
        ),
        tokenValidationErrors: counter(
            'authentication_token_validation_errors',
            'Number of token validation errors',
        ),
        tokenMissingExpClaimErrors: counter(
            'authentication_token_missing_exp_claim_errors',
            'Number of token missing `exp` claim errors',
        ),
    },
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
