import { isEmpty } from 'lodash-es';
import { Observable, switchMap } from 'rxjs';

import { TDashboard } from '../def/dashboard.ts';
import { TDashboardDraft, TDashboardDraftLookup, TUpdatableDashboardDraft } from '../def/draft.ts';
import { TUserName } from '../def/user.ts';
import { ETables } from './constants.ts';
import { client } from './postgres/index.ts';
import { subscribeToTableUpdates } from './subscription.ts';

type TGetDashboardDraftsLookupQuery = {
    user: TUserName;
    ids: TDashboard['id'][];
};

export async function upsertDraft(draft: TUpdatableDashboardDraft): Promise<void> {
    await client.insert<TUpdatableDashboardDraft>({
        table: ETables.Drafts,
        values: [draft],
        upsert: '"user", dashboard_id',
    });
}

export async function deleteDraft(
    draft: Pick<TUpdatableDashboardDraft, 'user' | 'dashboardId'>,
): Promise<void> {
    await client.insert<TUpdatableDashboardDraft>({
        table: ETables.Drafts,
        values: [{ ...draft, config: '', digest: '' }],
        upsert: '"user", dashboard_id',
    });
}

async function getCommonDrafts<T extends TDashboardDraft | TDashboardDraftLookup>(
    fields: string,
    user: TUserName,
    ids: TDashboard['id'][],
): Promise<T[]> {
    if (isEmpty(ids)) {
        return [];
    }

    return client.query<T>({
        query: `SELECT ${fields} from ${ETables.Drafts} WHERE "user" = {user: String} AND dashboard_id IN ({ids: Array(String)}) AND config != ''`,
        query_params: {
            user,
            ids,
        },
    });
}

function getPartialDrafts(
    user: TUserName,
    dashboardIds: TDashboard['id'][],
): Promise<TDashboardDraftLookup[]> {
    return getCommonDrafts('dashboard_id, digest', user, dashboardIds);
}

export async function getDraftById(
    user: TUserName,
    id: TDashboard['id'],
): Promise<TDashboardDraft | undefined> {
    const [draft] = await getCommonDrafts<TDashboardDraft>('*', user, [id]);
    return draft;
}

const trigger$ = subscribeToTableUpdates('drafts_update');

export function subscribeToDashboardDraftLookupUpdates(
    query: TGetDashboardDraftsLookupQuery,
): Observable<TDashboardDraftLookup[]> {
    return trigger$.pipe(switchMap(() => getPartialDrafts(query.user, query.ids)));
}
