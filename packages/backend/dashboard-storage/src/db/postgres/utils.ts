import { performance } from 'perf_hooks';
import type { Pool, QueryResult, QueryResultRow } from 'pg';

import { EMetricsLabel } from '../../def/metrics.ts';
import { metrics } from '../../utils/metrics.ts';
import { queryLimiter } from '../scheduler.ts';

export const operation = async <T extends QueryResultRow>(
    type: 'insert' | 'query' | 'delete',
    query: string,
    pool: Pool,
    metricsData: string,
): Promise<QueryResult<T>> => {
    const startTime = performance.now();
    try {
        const result = await queryLimiter.schedule(() => pool.query(query));
        metrics.db.totalQueries.inc({
            [EMetricsLabel.Type]: type,
            [EMetricsLabel.Value]: metricsData,
        });
        return result;
    } catch (err) {
        metrics.db.totalErroredQueries.inc({
            [EMetricsLabel.Type]: type,
            [EMetricsLabel.Value]: metricsData,
        });
        throw err;
    } finally {
        const duration = performance.now() - startTime;
        metrics.db.queryDuration.observe(
            { [EMetricsLabel.Type]: type, [EMetricsLabel.Value]: metricsData },
            duration,
        );
    }
};
