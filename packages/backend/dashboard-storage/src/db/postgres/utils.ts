import { performance } from 'perf_hooks';
import { Pool, QueryResult, QueryResultRow } from 'pg';

import { EMetricsLabels } from '../../def/metrics.ts';
import { metrics } from '../../utils/metrics.ts';
import { queryLimiter } from '../scheduler.ts';

export const operation = async <T extends QueryResultRow>(
    type: 'insert' | 'query',
    table: string,
    query: string,
    pool: Pool,
): Promise<QueryResult<T>> => {
    const startTime = performance.now();
    try {
        const result = await queryLimiter.schedule(() => pool.query(query));
        metrics.db.totalQueries.inc({
            [EMetricsLabels.Type]: type,
            [EMetricsLabels.Value]: table,
        });
        return result;
    } catch (err) {
        metrics.db.totalErroredQueries.inc({
            [EMetricsLabels.Type]: type,
            [EMetricsLabels.Value]: table,
        });
        throw err;
    } finally {
        const duration = performance.now() - startTime;
        metrics.db.queryDuration.observe(
            { [EMetricsLabels.Type]: type, [EMetricsLabels.Value]: table },
            duration,
        );
    }
};
