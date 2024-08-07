import { generateTraceId } from '@common/utils';
import type { Response } from 'express';
import type { Counter, Gauge, MetricConfiguration, Summary } from 'prom-client';
import { register } from 'prom-client';

import type { TBasicLogger } from './logger';

export const getMetricFunctions = (
    CounterConstructor: typeof Counter,
    GaugeConstructor: typeof Gauge,
    SummaryConstructor: typeof Summary,
) => {
    const metric = <
        MetricLabel extends string,
        T = Counter<MetricLabel> | Gauge<MetricLabel> | Summary<MetricLabel>,
    >(
        MetricConstructor: new (config: MetricConfiguration<MetricLabel>) => T,
    ): ((metricName: string, helpText?: string, labelNames?: MetricLabel[]) => T) => {
        return (metricName, helpText, labelNames = [] as MetricLabel[]) => {
            return new MetricConstructor({
                name: metricName,
                help: helpText ?? metricName,
                labelNames,
            });
        };
    };

    return {
        counter: metric(CounterConstructor),
        gauge: metric(GaugeConstructor),
        summary: metric(SummaryConstructor),
    };
};

export const getCommonSocketMetrics = ({
    counter,
    gauge,
}: Pick<ReturnType<typeof getMetricFunctions>, 'counter' | 'gauge'>) => {
    const authenticationErrors = counter('authentication_errors_total', 'Total amount of errors', [
        'error_type',
    ]);

    const createAuthenticationErrorsMetricWithLabel = (errorType: string) =>
        ({
            ...authenticationErrors,
            inc: (value?: number) => authenticationErrors.inc({ error_type: errorType }, value),
        }) as typeof authenticationErrors;

    return {
        socket: {
            total: counter('sockets_total', 'Total sockets opened since server startup'),
            active: gauge('active_sockets', 'Current open sockets'),
            schemaValidationErrors: counter(
                'sockets_schema_validation_errors_total',
                'Socket schema validation errors',
            ),
            notAuthenticatedErrors: counter(
                'sockets_schema_not_authenticated_errors_total',
                'Socket authentication errors',
            ),
            parseMessageErrors: counter(
                'sockets_parse_errors_total',
                'Incoming message to JSON parse errors',
            ),
            internalErrors: counter('sockets_internal_errors_total', 'Server internal errors'),
        },
        authentication: {
            authenticatedSockets: gauge(
                'authentication_authenticated_sockets',
                'Current number of authenticated sockets',
            ),
            tokenValidationErrors:
                createAuthenticationErrorsMetricWithLabel('token_validation_error'),
            tokenMissingExpClaimErrors: createAuthenticationErrorsMetricWithLabel(
                'token_missing_exp_claim_error',
            ),
        },
    };
};

// TODO: replace BFF, dashboard-storage handlers
export const metricsRouteHandler = async (res: Response, logger?: TBasicLogger) => {
    try {
        const metrics = await register.metrics();
        res.setHeader('Content-Type', register.contentType);
        res.send(metrics);
        logger?.info({
            message: 'Metrics request processed',
            traceId: generateTraceId(),
            metricsSize: metrics.length,
        });
    } catch (err) {
        logger?.error({
            message: 'Metrics request error',
            traceId: generateTraceId(),
            error: (err as Error)?.message,
        });
        res.status(500).send('Metrics internal error');
    }
};
