import type { TUserName } from '@common/types/src/primitives/index.ts';
import { isEmpty } from 'lodash-es';
import type { Observable } from 'rxjs';
import { switchMap } from 'rxjs';

import type { TDbDashboard } from '../def/dashboard.ts';
import type {
    TDashboardDraftLookup,
    TDbDashboardDraft,
    TUpdatableDbDashboardDraft,
} from '../def/draft.ts';
import { ETable } from './constants.ts';
import { client } from './postgres/index.ts';
import { subscribeToTableUpdates } from './subscription.ts';

type TGetDashboardDraftsLookupQuery = {
    user: TUserName;
    ids: TDbDashboard['id'][];
};

export async function upsertDraft(draft: TUpdatableDbDashboardDraft): Promise<void> {
    await client.insert<TUpdatableDbDashboardDraft>({
        table: ETable.Drafts,
        values: [draft],
        upsert: '"user", dashboard_id',
    });
}

export async function deleteDraft(
    draft: Pick<TUpdatableDbDashboardDraft, 'user' | 'dashboardId'>,
): Promise<void> {
    await client.insert<TUpdatableDbDashboardDraft>({
        table: ETable.Drafts,
        values: [{ ...draft, config: '', digest: '' }],
        upsert: '"user", dashboard_id',
    });
}

async function getCommonDrafts<T extends TDbDashboardDraft | TDashboardDraftLookup>(
    fields: string,
    user: TUserName,
    ids: TDbDashboard['id'][],
): Promise<T[]> {
    if (isEmpty(ids)) {
        return [];
    }

    return client.query<T>({
        query: `SELECT ${fields} from ${ETable.Drafts} WHERE "user" = {user: String} AND dashboard_id IN ({ids: Array(String)}) AND config != ''`,
        query_params: {
            user,
            ids,
        },
    });
}

function getPartialDrafts(
    user: TUserName,
    dashboardIds: TDbDashboard['id'][],
): Promise<TDashboardDraftLookup[]> {
    return getCommonDrafts('dashboard_id, digest', user, dashboardIds);
}

export async function getDraftById(
    user: TUserName,
    id: TDbDashboard['id'],
): Promise<TDbDashboardDraft | undefined> {
    const [draft] = await getCommonDrafts<TDbDashboardDraft>('*', user, [id]);
    return draft;
}

const trigger$ = subscribeToTableUpdates('drafts_update');

export function subscribeToDashboardDraftLookupUpdates(
    query: TGetDashboardDraftsLookupQuery,
): Observable<TDashboardDraftLookup[]> {
    return trigger$.pipe(switchMap(() => getPartialDrafts(query.user, query.ids)));
}
