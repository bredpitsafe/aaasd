import { randomUUID } from 'crypto';
import { first, isEmpty, isEqual } from 'lodash-es';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs';

import type { TDbDashboard, TGrpcDashboard } from '../def/dashboard.ts';
import { ETable } from './constants.ts';
import { fromDbDashboard } from './converters.ts';
import { fromGrpcKind } from './enum-convertors/kind.convertor.ts';
import { fromGrpcStatus } from './enum-convertors/status.convertor.ts';
import { client } from './postgres/index.ts';
import { subscribeToTableUpdates } from './subscription.ts';
import { getDigest } from './utils.ts';

type TUpdatableDbDashboard = Pick<TDbDashboard, 'name' | 'config'> &
    Partial<Omit<TDbDashboard, 'name' | 'config'>>;

export async function upsertDashboard(
    dashboard: Pick<TGrpcDashboard, 'name' | 'config'> &
        Partial<Omit<TGrpcDashboard, 'name' | 'config'>>,
): Promise<TDbDashboard['id']> {
    const id = dashboard.id ?? randomUUID();

    const newDashboard: TUpdatableDbDashboard = {
        id,
        config: dashboard.config,
        name: dashboard.name,
        kind: fromGrpcKind(dashboard.kind ?? 'KIND_USER'),
        status: fromGrpcStatus(dashboard.status ?? 'STATUS_ACTIVE'),
        digest: getDigest(dashboard.config),
    };

    await client.insert<TUpdatableDbDashboard>({
        table: ETable.Dashboards,
        values: [newDashboard],
        upsert: 'id',
    });

    return id;
}

export async function getDashboardById(
    id: TGrpcDashboard['id'],
): Promise<TGrpcDashboard | undefined> {
    const result = await client.query<TDbDashboard>({
        query: `SELECT * from ${ETable.Dashboards} WHERE id = {id: String}`,
        query_params: {
            id,
        },
    });

    const dbDashboard = first(result);

    return dbDashboard && fromDbDashboard(dbDashboard);
}

export async function getDashboardsByDigest(
    digest: TGrpcDashboard['digest'],
): Promise<Pick<TGrpcDashboard, 'id'>[]> {
    return client.query<Pick<TDbDashboard, 'id'>>({
        query: `SELECT id from ${ETable.Dashboards} WHERE digest = {digest: String}`,
        query_params: {
            digest,
        },
    });
}

export async function getDashboardAtRevision(
    id: TGrpcDashboard['id'],
    digest: TGrpcDashboard['digest'],
): Promise<TGrpcDashboard | undefined> {
    const result = await client.query<TDbDashboard>({
        query: `SELECT * from ${ETable.DashboardLog} WHERE id = {id: String} AND digest = {digest: String} LIMIT 1`,
        query_params: {
            id,
            digest,
        },
    });

    const dbDashboard = first(result);

    return dbDashboard && fromDbDashboard(dbDashboard);
}

async function getCommonDashboards(
    fields: string,
    ids: TGrpcDashboard['id'][],
): Promise<TGrpcDashboard[]> {
    if (isEmpty(ids)) {
        return [];
    }

    const dbDashboards = await client.query<TDbDashboard>({
        query: `SELECT ${fields} from ${ETable.Dashboards} WHERE id IN ({ids: Array(String)})`,
        query_params: {
            ids,
        },
    });

    return dbDashboards.map((dbDashboard) => fromDbDashboard(dbDashboard));
}

const trigger$ = subscribeToTableUpdates('dashboards_update');

type TGetDashboardsQuery = {
    ids: TGrpcDashboard['id'][];
};

export function subscribeToDashboardUpdates(
    query: TGetDashboardsQuery,
): Observable<TGrpcDashboard[]> {
    return trigger$.pipe(
        switchMap(() =>
            getCommonDashboards('id,name,kind,status,insertion_time,digest', query.ids),
        ),
        distinctUntilChanged<TGrpcDashboard[]>(isEqual),
    );
}
