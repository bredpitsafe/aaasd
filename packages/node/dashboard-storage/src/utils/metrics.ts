import type { Response } from 'express';
import { fromPairs } from 'lodash-es';
import {
    collectDefaultMetrics,
    Counter,
    Gauge,
    MetricConfiguration,
    register,
    Summary,
} from 'prom-client';

import { EActorName } from '../def/actor.ts';
import { EMetricsLabels } from '../def/metrics.ts';
import { config } from './config.ts';
import { logger } from './logger.ts';
import { generateTraceId } from './traceId/index.ts';

// Send some default NodeJS metrics to Prometheus
const defaultLabels = fromPairs(config.metrics.labels);

collectDefaultMetrics({
    prefix: config.metrics.prefix,
    labels: defaultLabels,
});

function metric<T = Counter | Gauge | Summary>(
    MetricClass: new (config: MetricConfiguration<string>) => T,
): (metricName: string, helpText?: string, labels?: EMetricsLabels[]) => T {
    return (metricName, helpText, labels = [] as EMetricsLabels[]) => {
        return new MetricClass({
            name: `${config.metrics.prefix}${metricName}`,
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
    dashboards: {
        list: gauge('dashboards_list', 'Current active `DashboardList` subscriptions'),
        dashboard: gauge('dashboards_dashboard', 'Current active `Dashboard` subscriptions'),
    },
    subscriptions: {
        total: counter('subscriptions_total', 'Total subscriptions opened since server startup', [
            EMetricsLabels.Type,
        ]),
        active: gauge('subscriptions_active', 'Current active subscriptions', [
            EMetricsLabels.Type,
        ]),
        errors: counter('subscriptions_errors_total', 'Errored subscriptions', [
            EMetricsLabels.Type,
            EMetricsLabels.ErrorType,
        ]),
        actorErrors: counter(
            'subscriptions_actors_errors',
            'Errors from actors (expected errors)',
            [EMetricsLabels.Type, EMetricsLabels.ErrorType],
        ),
        unspecifiedErrors: counter(
            'subscriptions_unspecified_errors',
            'Unspecified errors (unexpected errors)',
            [EMetricsLabels.Type, EMetricsLabels.Value],
        ),
        firstResponseDuration: summary(
            'subscriptions_first_response_duration',
            'First response processing duration',
            [EMetricsLabels.Type],
        ),
    },
    db: {
        totalQueries: counter('db_total_queries', 'Total number of DB queries processed', [
            EMetricsLabels.Type,
            EMetricsLabels.Value,
        ]),
        watchQueriesActive: gauge('db_watch_queries_active', 'Current active `Watch` queries', [
            EMetricsLabels.Type,
        ]),
        totalErroredQueries: counter('db_errored_queries', 'Total number of errored queries', [
            EMetricsLabels.Type,
            EMetricsLabels.Value,
        ]),
        queryDuration: summary('db_query_duration', 'Query duration', [
            EMetricsLabels.Type,
            EMetricsLabels.Value,
        ]),
    },
    drafts: {
        updated: counter('drafts_updated', 'Total number of updated drafts'),
        reset: counter('drafts_reset', 'Total number of reset drafts'),
    },
    permissions: {
        shared: counter('permissions_share', 'Total number of changed sharing permissions'),
        updated: counter('permissions_updated', 'Total number of updated permissions'),
    },
};

export const metricsHandler = async (res: Response) => {
    try {
        const metrics = await register.metrics();
        res.setHeader('Content-Type', register.contentType);
        res.send(metrics);
        logger.info({
            message: 'Metrics request processed',
            actor: EActorName.Root,
            traceId: generateTraceId(),
            metricsSize: metrics.length,
        });
    } catch (err) {
        logger.error({
            message: 'Metrics request error',
            actor: EActorName.Root,
            traceId: generateTraceId(),
            error: (err as Error)?.message,
        });
        res.status(500).send('Metrics internal error');
    }
};
