import { getCommonSocketMetrics, getMetricFunctions } from '@backend/utils/src/metrics.ts';
import { collectDefaultMetrics, Counter, Gauge, Summary } from 'prom-client';

import { EMetricsLabel } from '../def/metrics.ts';
// TODO: move this file into src/modules/metrics

export const initializeMetricsCollect = () => {
    collectDefaultMetrics();
};

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

// TODO: move to @backend/grpc/src/utils/metrics.ts and share among grpc services
const grpcMetrics = {
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
};

// TODO: figure out whether all metrics still needed after grpc migration
// TODO: replace this object into getter function, cuz tests conflicting with this object, cuz it registers metrics twice
export const metrics = {
    ...getCommonSocketMetrics({ counter, gauge }),
    ...grpcMetrics,
    dashboards: {
        list: gauge(
            'dashboards_list_subscriptions',
            'Current active `DashboardsList` subscriptions',
        ),
        dashboard: gauge(
            'dashboards_dashboard_subscriptions',
            'Current active `Dashboard` subscriptions',
        ),
    },
    subscriptions: {
        total: counter('subscriptions_total', 'Total subscriptions opened since server startup', [
            EMetricsLabel.RpcName,
        ]),
        active: gauge('active_subscriptions', 'Current active subscriptions', [
            EMetricsLabel.RpcName,
        ]),
        errors: counter('subscriptions_errors_total', 'Errored subscriptions', [
            EMetricsLabel.Type,
            EMetricsLabel.ErrorType,
        ]),
        actorErrors: counter(
            'subscriptions_actor_errors_total',
            'Errors from actors (expected errors)',
            [EMetricsLabel.Type, EMetricsLabel.ErrorType],
        ),
        unexpectedErrors: counter(
            'subscriptions_unexpected_errors_total',
            'Subscriptions unexpected errors',
            [EMetricsLabel.Type, EMetricsLabel.Value],
        ),
        firstResponseDuration: summary(
            'subscriptions_first_response_duration_seconds',
            'Subscriptions first response processing duration in seconds',
            [EMetricsLabel.Type],
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
        totalQueries: counter('db_queries_total', 'Total number of DB queries processed', [
            EMetricsLabel.Type,
            EMetricsLabel.Value,
        ]),
        watchQueriesActive: gauge('db_active_watch_queries', 'Current active `Watch` queries', [
            EMetricsLabel.Type,
        ]),
        totalErroredQueries: counter(
            'db_errored_queries_total',
            'Total number of errored queries',
            [EMetricsLabel.Type, EMetricsLabel.Value],
        ),
        queryDuration: summary('db_query_duration', 'Query duration', [
            EMetricsLabel.Type,
            EMetricsLabel.Value,
        ]),
    },
    drafts: {
        updated: counter('drafts_updated_total', 'Total number of updated drafts'),
        reset: counter('drafts_reset_total', 'Total number of reset drafts'),
    },
    permissions: {
        shared: counter('permissions_shared_total', 'Total number of changed sharing permissions'),
        updated: counter('permissions_updated_total', 'Total number of updated permissions'),
    },
};
