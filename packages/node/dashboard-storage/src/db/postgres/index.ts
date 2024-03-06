import pg, { ClientConfig, PoolClient, PoolConfig, QueryResultRow } from 'pg';
import format from 'pg-format';
import {
    catchError,
    finalize,
    firstValueFrom,
    from,
    fromEvent,
    map,
    merge,
    Observable,
    of,
    shareReplay,
    switchMap,
    throwError,
} from 'rxjs';
import { tap } from 'rxjs/operators';

import { EActorName } from '../../def/actor.ts';
import { EMetricsLabels } from '../../def/metrics.ts';
import { config } from '../../utils/config.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { logger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';
import { TraceId } from '../../utils/traceId/index.ts';
import { fromDB, toDB } from '../converters.ts';
import { operation, TOperationOptions } from './utils.ts';

type InsertParams<T> = {
    client?: PoolClient;
    table: string;
    values: T[];
    upsert?: string;
    options?: TOperationOptions;
};

type QueryParams = {
    client?: PoolClient;
    query: string;
    query_params?: Record<string, unknown>;
    options?: TOperationOptions;
};

type ListenParams = {
    eventName: string;
    traceId: TraceId;
};

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
pool.on('error', () => {
    // Do nothing, error will be caught by pool clients.
    // Only catch error here since without catching it `pg` will throw global unhandled exception
});

const getPoolClient = (): Observable<PoolClient> => {
    return from(pool.connect()).pipe(
        switchMap((client) => {
            // Do NOT use `fromEvent` here since `pg` can emit several errors per client.
            // We MUST listen to all of those because unsubscribing from event listener
            // will result in global unhandled exceptions.
            const error$ = new Observable<never>((subscriber) => {
                const onError = (err: Error) => {
                    subscriber.error(err);
                    subscriber.complete();
                };
                client.on('error', onError);
                return () => {
                    client.off('error', onError);
                };
            });

            return merge(of(client), error$);
        }),
    );
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
    const client = params.client ?? (await firstValueFrom(getPoolClient()));
    return operation('insert', params.table, sql, client, params.options);
};

const query = async <T extends QueryResultRow>(params: QueryParams): Promise<T[]> => {
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

    const client = params.client ?? (await firstValueFrom(getPoolClient()));
    const { rows } = await operation<T>('query', params.query, sql, client, params.options);
    return rows.map(fromDB);
};

const listen = <T>(params: ListenParams): Observable<T> => {
    const { eventName, traceId } = params;
    return of(undefined).pipe(
        tap(() => {
            metrics.db.watchQueriesActive.inc({ [EMetricsLabels.Type]: eventName });
            logger.debug({
                actor: EActorName.Database,
                message: 'subscribed to notification events',
                eventName,
                traceId,
            });
        }),
        switchMap(() => getPoolClient()),
        switchMap(async (client) => {
            const query = `LISTEN "${eventName}"`;
            return client.query(query).then(() => {
                logger.debug({
                    actor: EActorName.Database,
                    message: 'LISTEN query finished, notifications are active',
                    eventName,
                    traceId,
                });
                return client;
            });
        }),
        switchMap((client) => {
            return fromEvent<{ payload: string }>(client, 'notification').pipe(
                tap((event) =>
                    logger.debug({
                        actor: EActorName.Database,
                        message: 'received notification event',
                        eventName,
                        event,
                        traceId,
                    }),
                ),
                map((event) => JSON.parse(event.payload) as T),
                finalize(() => {
                    logger.debug({
                        actor: EActorName.Database,
                        message: 'release notifications client back to the pool',
                        eventName,
                        traceId,
                    });
                    void client.release(true);
                }),
            );
        }),
        catchError((err) => {
            return throwError(
                () =>
                    new ActorError({
                        kind: EActorErrorKind.Database,
                        title: 'Database notification subscription has failed',
                        description: 'Subscription is not updatable anymore and will be closed',
                        args: {
                            message: err.message,
                        },
                    }),
            );
        }),
        finalize(() => {
            metrics.db.watchQueriesActive.dec({ [EMetricsLabels.Type]: eventName });
            logger.debug({
                actor: EActorName.Database,
                message: 'unsubscribed from notification events',
                eventName,
                traceId,
            });
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
};

export const client = { insert, query, listen };
