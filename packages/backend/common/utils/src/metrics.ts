import { fromPairs } from 'lodash-es';
import { Counter, Gauge, MetricConfiguration, Summary } from 'prom-client';

// Send some default NodeJS metrics to Prometheus
export const getDefaultLabels = (configLabels: [string, string][]) => fromPairs(configLabels);

export const getMetricFunctions = <MetricsLabel extends string>(metricsConfig: {
    prefix: string;
    labels: [string, string][];
}) => {
    const metric = <T = Counter | Gauge | Summary>(
        MetricClass: new (config: MetricConfiguration<string>) => T,
    ): ((metricName: string, helpText?: string, labels?: MetricsLabel[]) => T) => {
        return (metricName, helpText, labels = [] as MetricsLabel[]) => {
            return new MetricClass({
                name: `${metricsConfig.prefix}${metricName}`,
                help: helpText ?? metricName,
                labelNames: Object.keys(getDefaultLabels(metricsConfig.labels)).concat(labels),
            });
        };
    };

    return {
        counter: metric(Counter),
        gauge: metric(Gauge),
        summary: metric(Summary),
    };
};

export const getCommonSocketMetrics = ({
    counter,
    gauge,
}: ReturnType<typeof getMetricFunctions>) => ({
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
});
