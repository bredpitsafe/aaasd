import {
    getCommonSocketMetrics,
    getDefaultLabels,
    getMetricFunctions,
} from '@backend/utils/src/metrics.ts';
import { generateTraceId } from '@backend/utils/src/traceId/index.ts';
import type { Response } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';

import { EActorName } from '../def/actor.ts';
import { EMetricsLabels } from '../def/metrics.ts';
import { config } from './config.ts';
import { logger } from './logger.ts';
// TODO: move this file into src/modules/metrics
// Send some default NodeJS metrics to Prometheus
const defaultLabels = getDefaultLabels(config.metrics.labels);

collectDefaultMetrics({
    prefix: config.metrics.prefix,
    labels: defaultLabels,
});

const metricsFunctions = getMetricFunctions(config.metrics);
const { counter, gauge, summary } = metricsFunctions;

export const metrics = {
    ...getCommonSocketMetrics(metricsFunctions),
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
        pool: {
            total: gauge('db_pool_total_clients', 'Total number of clients in the Postgres pool'),
            idle: gauge('db_pool_idle_clients', 'Number of idle clients in the Postgres pool'),
            waiting: gauge(
                'db_pool_waiting_clients',
                'Number of waiting clients in the Postgres pool',
            ),
        },

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
