import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { isLastFocusedTab$ } from '@frontend/common/src/utils/observable/isLastFocusedTab';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { isUndefined } from 'lodash-es';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

import {
    ERequestQueryType,
    RequestQueryDesc,
    SAVED_QUERY_NOT_FOUND,
    TRequestQuery,
} from '../domain/RequestQuery';
import { getAppDb, TDBRequestQuery } from './db';

const DRAFT_ID = -1 as TRequestQuery['id'];
const ModuleRequestQueriesFail = FailFactory('ModuleRequestQueries');
const UNKNOWN = ModuleRequestQueriesFail('UNKNOWN');
const RequestQueries = ValueDescriptorFactory<Array<TRequestQuery>, typeof UNKNOWN>();
type RequestQueriesValueDesc = ExtractValueDescriptor<typeof RequestQueries>;
type TRequestQueryDesc = ExtractValueDescriptor<typeof RequestQueryDesc>;

export const ModuleRequestQuery = ModuleFactory(() => {
    const dbPromise = getAppDb(() => {});
    const refreshRequestQueries$ = new BehaviorSubject(undefined);
    const getRequestQueries = dedobs(
        (): Observable<RequestQueriesValueDesc> => {
            let prevResult: undefined | Array<TRequestQuery> = undefined;
            return refreshRequestQueries$.pipe(
                switchMap(
                    (): Observable<RequestQueriesValueDesc> =>
                        new Observable((sub) => {
                            sub.next(RequestQueries.unsc(null, prevResult));
                            async function getData() {
                                const db = await dbPromise;
                                const store = db.transaction('request_query', 'readonly').store;
                                const dbResult = await store.getAll();
                                const result = dbResult.map(convertResultToRequestQuery);
                                result.sort((a, b) => b.lastRequestTs - a.lastRequestTs);
                                prevResult = result;
                                sub.next(RequestQueries.sync(result, null));
                            }
                            getData();
                        }),
                ),
            );
        },
        { removeDelay: DEDUPE_REMOVE_DELAY },
    );

    const getManuallySavedQueries = dedobs(
        (): Observable<RequestQueriesValueDesc> => {
            let prevResult: undefined | Array<TRequestQuery> = undefined;
            return refreshRequestQueries$.pipe(
                switchMap(
                    (): Observable<RequestQueriesValueDesc> =>
                        new Observable((sub) => {
                            sub.next(RequestQueries.unsc(null, prevResult));
                            async function getData() {
                                const db = await dbPromise;
                                const store = db.transaction('request_query', 'readonly').store;
                                const dbResult = await store
                                    .index('type')
                                    .getAll(ERequestQueryType.Manual);
                                const result = dbResult.map(convertResultToRequestQuery);
                                result.sort((a, b) => b.lastRequestTs - a.lastRequestTs);
                                prevResult = result;
                                sub.next(RequestQueries.sync(result, null));
                            }
                            getData();
                        }),
                ),
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

    function getRequestQuery(id: TRequestQuery['id']): Observable<TRequestQueryDesc> {
        if (id === DRAFT_ID) return of(RequestQueryDesc.fail(SAVED_QUERY_NOT_FOUND));
        return new Observable((sub) => {
            sub.next(RequestQueryDesc.unsc(null));
            const db = dbPromise;
            const tx = db.then((db) => db.transaction('request_query', 'readwrite'));
            tx.then((tx) => {
                tx.store.get(id).then((result) => {
                    if (isUndefined(result)) {
                        sub.next(RequestQueryDesc.fail(SAVED_QUERY_NOT_FOUND));
                    } else {
                        sub.next(RequestQueryDesc.sync(convertResultToRequestQuery(result), null));
                    }
                });
            });
        });
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
        getRequestQueries,
        getManuallySavedQueries,
        saveQuery,
        getRequestQuery,
        deleteRequestQuery,
        clearHistory,
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
