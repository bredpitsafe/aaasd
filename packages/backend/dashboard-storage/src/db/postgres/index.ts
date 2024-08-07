import type { TraceId } from '@common/utils';
import type { ClientConfig, PoolConfig, QueryResultRow } from 'pg';
import pg from 'pg';
import format from 'pg-format';
import type { Observable } from 'rxjs';
import { catchError, finalize, from, fromEvent, map, of, switchMap, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EActorName } from '../../def/actor.ts';
import { EMetricsLabel } from '../../def/metrics.ts';
import { config } from '../../utils/config.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { defaultLogger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';
import { fromDB, toDB } from '../converters.ts';
import { operation } from './utils.ts';

const clientConfig: ClientConfig = {
    host: config.postgres.host,
    port: config.postgres.port,
    database: config.postgres.databaseName,
    user: config.postgres.username,
    password: config.postgres.password,
    keepAlive: true,
    application_name: config.service.name,
};

const poolConfig: PoolConfig = {
    ...clientConfig,
    min: config.postgres.minPoolSize,
    max: config.postgres.maxPoolSize,
    allowExitOnIdle: config.postgres.allowExitOnIdle,
    connectionTimeoutMillis: config.postgres.connectionTimeout,
    idleTimeoutMillis: config.postgres.idleTimeout,
};

const pool = new pg.Pool(poolConfig);

const updatePoolMetrics = () => {
    metrics.db.pool.total.set(pool.totalCount);
    metrics.db.pool.idle.set(pool.idleCount);
    metrics.db.pool.waiting.set(pool.waitingCount);
};

const dbLogger = defaultLogger.createChildLogger({ actor: EActorName.Database });

pool.on('error', () => {
    // Do nothing, error will be caught by pool clients.
    // Only catch error here since without catching it `pg` will throw global unhandled exception
});
pool.on('connect', updatePoolMetrics);
pool.on('acquire', updatePoolMetrics);
pool.on('release', updatePoolMetrics);
pool.on('remove', updatePoolMetrics);

type InsertParams<T> = {
    table: string;
    values: T[];
    upsert?: string;
};

const insert = async <T extends Record<string, unknown>>(params: InsertParams<T>) => {
    if (params.values.length === 0) {
        throw new Error('insert values list is empty');
    }

    const values = params.values.map(toDB);
    const [value] = values;
    const keys = Object.keys(value);
    const conflictKeys = params.upsert ? keys.map((key) => [key, key]).flat() : [];

    const items = values.map((v) => Object.values(v) as unknown[]);
    const sqlTemplate = `INSERT INTO %I(%I) VALUES ${Array(items.length).fill('(%L)').join(', ')}${
        params.upsert
            ? ` ON CONFLICT (%s) DO UPDATE SET ${keys.map(() => '%I = excluded.%I').join(', ')}`
            : ''
    }`;
    const sql = format(sqlTemplate, params.table, keys, ...items, params.upsert, ...conflictKeys);

    return operation('insert', sql, pool, params.table);
};

type TDeleteParams<T extends Record<string, unknown>> = {
    table: string;
    conditions: Partial<T>;
};

const deleteRows = async <T extends Record<string, unknown>>(params: TDeleteParams<T>) => {
    const keys = Object.keys(toDB(params.conditions));
    const values = Object.values(params.conditions);

    if (keys.length === 0) {
        throw new Error('Table name and conditions are required for deletion.');
    }

    const whereClause = keys
        .map((key, index) => format('%I = %L', key, values[index]))
        .join(' AND ');

    const sqlTemplate = `DELETE FROM %I WHERE ${whereClause}`;
    const sql = format(sqlTemplate, params.table);

    return operation('delete', sql, pool, params.table);
};

type TQueryParams = {
    query: string;
    query_params?: Record<string, unknown>;
};

const query = async <T extends QueryResultRow>(params: TQueryParams): Promise<T[]> => {
    // Find replacement matches in the query (format is similar to Clickhouse client)
    let sql = params.query;
    const re = /\{(\w+):.+?\}/g;
    let match: RegExpExecArray | null;
    const matches: { key: string; originalStr: string }[] = [];
    while ((match = re.exec(params.query)) != null) {
        matches.push({ key: match[1], originalStr: match[0] });
    }

    // Replace matches in query
    const values = matches.reduce((acc, match) => {
        sql = sql.replaceAll(match.originalStr, `%L`);
        const value = params.query_params?.[match.key];
        acc.push(value);
        return acc;
    }, [] as unknown[]);

    // Format query with replacement values
    sql = format(sql, ...values);

    const { rows } = await operation<T>('query', sql, pool, params.query);

    return rows.map(fromDB);
};

type TListenParams = {
    eventName: string;
    traceId: TraceId;
};

const listen = <T>(params: TListenParams): Observable<T> => {
    const { eventName, traceId } = params;
    return of(undefined).pipe(
        switchMap(() => pool.connect()),
        tap(() => {
            metrics.db.watchQueriesActive.inc({ [EMetricsLabel.Type]: eventName });
            dbLogger.debug({
                message: 'subscribed to notification events',
                eventName,
                traceId,
            });
        }),
        switchMap((client) => {
            const query = `LISTEN "${eventName}"`;
            return from(client.query(query)).pipe(
                switchMap(() => {
                    dbLogger.debug({
                        message: 'LISTEN query finished, notifications are active',
                        eventName,
                        traceId,
                    });

                    return fromEvent<{ payload: string }>(client, 'notification');
                }),
                tap((event) =>
                    dbLogger.debug({
                        message: 'received notification event',
                        eventName,
                        event,
                        traceId,
                    }),
                ),
                map((event) => JSON.parse(event.payload) as T),

                finalize(() => {
                    metrics.db.watchQueriesActive.dec({ [EMetricsLabel.Type]: eventName });
                    void client.release(true);
                    dbLogger.debug({
                        message:
                            'unsubscribed from notification events & released notifications client back to the pool',
                        eventName,
                        traceId,
                    });
                }),
            );
        }),
        catchError((err) => {
            return throwError(
                () =>
                    new ActorError({
                        kind: EActorErrorKind.Database,
                        title: 'Database notification subscription has failed',
                        description: err.message,
                    }),
            );
        }),
    );
};

export const client = { insert, delete: deleteRows, query, listen };
