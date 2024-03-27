import { randomUUID } from 'crypto';
import { isEmpty, isEqual } from 'lodash-es';
import { distinctUntilChanged, Observable, switchMap } from 'rxjs';

import { TDashboard } from '../def/dashboard.ts';
import { Kind, Status } from '../def/response.ts';
import { ETables } from './constants.ts';
import { client } from './postgres/index.ts';
import { subscribeToTableUpdates } from './subscription.ts';
import { getDigest } from './utils.ts';

type TUpdatableDashboard = Pick<TDashboard, 'name' | 'config' | 'status'> & {
    id?: TDashboard['id'];
    legacyId?: TDashboard['legacyId'];
    status?: TDashboard['status'];
    kind?: TDashboard['kind'];
};

type TGetDashboardsQuery = {
    ids: TDashboard['id'][];
};

export async function upsertDashboard(dashboard: TUpdatableDashboard): Promise<TDashboard['id']> {
    const id = dashboard.id ?? randomUUID();

    const newDashboard = {
        id,
        legacyId: dashboard.legacyId,
        config: dashboard.config,
        name: dashboard.name,
        kind: dashboard.kind ?? Kind.User,
        status: dashboard.status ?? Status.Active,
        digest: getDigest(dashboard),
    };

    await client.insert<TUpdatableDashboard>({
        table: ETables.Dashboards,
        values: [newDashboard],
        upsert: 'id',
    });
    return id;
}

export async function getDashboardById(id: TDashboard['id']): Promise<TDashboard | undefined> {
    const result = await client.query<TDashboard>({
        query: `SELECT * from ${ETables.Dashboards} WHERE id = {id: String}`,
        query_params: {
            id,
        },
    });

    return result[0];
}

export async function getDashboardsByDigest(
    digest: TDashboard['digest'],
): Promise<Pick<TDashboard, 'id'>[]> {
    return client.query<Pick<TDashboard, 'id'>>({
        query: `SELECT id from ${ETables.Dashboards} WHERE digest = {digest: String}`,
        query_params: {
            digest,
        },
    });
}

export async function getDashboardAtRevision(
    id: TDashboard['id'],
    digest: TDashboard['digest'],
): Promise<TDashboard | undefined> {
    const result = await client.query<TDashboard>({
        query: `SELECT * from ${ETables.DashboardLog} WHERE id = {id: String} AND digest = {digest: String} LIMIT 1`,
        query_params: {
            id,
            digest,
        },
    });

    return result[0];
}

export async function getDashboardByLegacyId(
    legacyId: TDashboard['legacyId'],
): Promise<TDashboard | undefined> {
    const result = await client.query<TDashboard>({
        query: `SELECT * from ${ETables.Dashboards} WHERE legacy_id = {legacyId: String} LIMIT 1`,
        query_params: {
            legacyId,
        },
    });

    return result[0];
}

async function getCommonDashboards(fields: string, ids: TDashboard['id'][]): Promise<TDashboard[]> {
    if (isEmpty(ids)) {
        return [];
    }

    return client.query<TDashboard>({
        query: `SELECT ${fields} from ${ETables.Dashboards} WHERE id IN ({ids: Array(String)})`,
        query_params: {
            ids,
        },
    });
}

const trigger$ = subscribeToTableUpdates('dashboards_update');

export function subscribeToDashboardUpdates(query: TGetDashboardsQuery): Observable<TDashboard[]> {
    return trigger$.pipe(
        switchMap(() =>
            getCommonDashboards('id,name,kind,status,insertion_time,digest', query.ids),
        ),
        distinctUntilChanged<TDashboard[]>(isEqual),
    );
}
