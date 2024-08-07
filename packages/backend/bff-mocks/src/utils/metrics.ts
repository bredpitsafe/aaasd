import { getMetricFunctions } from '@backend/utils/src/metrics.ts';
import { generateTraceId } from '@common/utils';
import type { Response } from 'express';
import { collectDefaultMetrics, Counter, Gauge, register, Summary } from 'prom-client';

import { EActorName } from '../def/actor.ts';
import { EMetricsLabels } from '../def/metrics.ts';
import { defaultLogger } from './logger.ts';

collectDefaultMetrics();

const { counter, gauge } = getMetricFunctions(Counter, Gauge, Summary);

export const metrics = {
    subscriptions: {
        total: counter('subscriptions_total', 'Total subscriptions opened since server startup', [
            EMetricsLabels.Endpoint,
        ]),
        messages: counter(
            'messages_total',
            'Total number of output messages sent since server startup',
            [EMetricsLabels.Endpoint],
        ),
        active: gauge('active_subscriptions', 'Current active subscriptions', [
            EMetricsLabels.Endpoint,
        ]),
        errors: counter('subscriptions_errors_total', 'Errored subscriptions', [
            EMetricsLabels.Endpoint,
        ]),
    },
};

export const metricsHandler = async (res: Response) => {
    try {
        const metrics = await register.metrics();
        res.setHeader('Content-Type', register.contentType);
        res.send(metrics);
        defaultLogger.info({
            message: 'Metrics request processed',
            actor: EActorName.Root,
            traceId: generateTraceId(),
            metricsSize: metrics.length,
        });
    } catch (err) {
        defaultLogger.error({
            message: 'Metrics request error',
            actor: EActorName.Root,
            traceId: generateTraceId(),
            error: (err as Error)?.message,
        });
        res.status(500).send('Metrics internal error');
    }
};
