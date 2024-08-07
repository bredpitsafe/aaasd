import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import { isLastFocusedTab$ } from '@frontend/common/src/utils/observable/isLastFocusedTab';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';
import { BehaviorSubject, switchMap } from 'rxjs';

import type { TRequestQuery } from '../types';
import { ERequestQueryType } from '../types';
import type { TDBRequestQuery } from './db';
import { getAppDb } from './db';

export const ModuleRequestQuery = ModuleFactory(() => {
    const dbPromise = getAppDb(() => {});
    const getDBStore = async () => {
        const db = await dbPromise;
        return db.transaction('request_query', 'readonly').store;
    };
    const refreshRequestQueries$ = new BehaviorSubject(undefined);

    const subscribeToRequestQueries = dedobs(
        (): Observable<TRequestQuery[]> => {
            return refreshRequestQueries$.pipe(
                switchMap(getDBStore),
                switchMap(async (store): Promise<TRequestQuery[]> => {
                    const dbResult = await store.getAll();
                    const result = dbResult.map(convertResultToRequestQuery);
                    return result.sort((a, b) => b.lastRequestTs - a.lastRequestTs);
                }),
            );
        },
        {
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    const getManuallySavedQueries = dedobs(
        (): Observable<TRequestQuery[]> => {
            return refreshRequestQueries$.pipe(
                switchMap(getDBStore),
                switchMap(async (store): Promise<TRequestQuery[]> => {
                    const dbResult = await store.index('type').getAll(ERequestQueryType.Manual);
                    const result = dbResult.map(convertResultToRequestQuery);
                    return result.sort((a, b) => b.lastRequestTs - a.lastRequestTs);
                }),
            );
        },
        { removeDelay: DEDUPE_REMOVE_DELAY },
    );

    async function saveQuery({
        name,
        query,
        type,
    }: {
        name: string;
        query: string;
        type: ERequestQueryType;
    }) {
        const db = await dbPromise;
        const tx = db.transaction('request_query', 'readwrite');
        const { store } = tx;
        const hash = shallowHash(query);
        const prev = await store.get(hash);
        if (isUndefined(prev)) {
            store.add({
                id: hash,
                name,
                query,
                lastRequestTs: Date.now(),
                type,
            });
        } else {
            if (prev.type === ERequestQueryType.Manual && type === ERequestQueryType.Auto) {
                store.put({
                    ...prev,
                    lastRequestTs: Date.now(),
                });
            } else {
                store.put({
                    ...prev,
                    name,
                    lastRequestTs: Date.now(),
                    type,
                });
            }
        }
        await tx.done;
        refreshRequestQueries$.next(undefined);
    }

    async function deleteRequestQuery(
        id: TRequestQuery['id'],
        options?: { deleteFromHistory: boolean },
    ) {
        const { deleteFromHistory = false } = options ?? {};
        const db = await dbPromise;
        const tx = db.transaction('request_query', 'readwrite');
        const { store } = tx;
        if (deleteFromHistory) {
            await store.delete(id);
        } else {
            const prev = await store.get(id);
            if (isUndefined(prev) || prev.type !== ERequestQueryType.Manual) return;
            store.put({
                ...prev,
                name: JSON.parse(prev.query).type,
                type: ERequestQueryType.Auto,
            });
        }
        await tx.done;
        refreshRequestQueries$.next(undefined);
    }

    async function clearHistory() {
        const db = await dbPromise;
        const tx = db.transaction('request_query', 'readwrite');
        const { store } = tx;
        const index = await store.index('type');
        const range = IDBKeyRange.only(ERequestQueryType.Auto);

        index.openCursor(range).then((cursor) => {
            if (cursor) {
                store.delete(cursor.primaryKey);
                cursor.continue();
            }
        });

        await tx.done;
        refreshRequestQueries$.next(undefined);
    }

    isLastFocusedTab$.subscribe(() => {
        refreshRequestQueries$.next(undefined);
    });

    return {
        subscribeToRequestQueries,
        getManuallySavedQueries,
        saveQuery,
        clearHistory,
        deleteRequestQuery,
    };
});

function convertResultToRequestQuery(r: TDBRequestQuery['value']): TRequestQuery {
    return {
        id: r.id as TRequestQuery['id'],
        name: r.name,
        query: r.query,
        lastRequestTs: r.lastRequestTs,
        type: r.type,
    };
}
