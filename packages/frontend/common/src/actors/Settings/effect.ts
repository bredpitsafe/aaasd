import type { IDBPDatabase } from 'idb';
import { isNil } from 'lodash-es';
import { from, Observable, switchMap, tap } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { progressiveRetry } from '../../utils/Rx/progressiveRetry';
import type { TSettingsSetter } from './actions';
import type { ISettingsSchema } from './db';
import { actionsBox } from './store';
import { getSettingsStoreName, updateMemoryValue } from './utils';

export function initDBSyncEffects(db$: Observable<IDBPDatabase<ISettingsSchema>>) {
    initPersistSettingsEffect(db$);
}

export function initPersistSettingsEffect(db$: Observable<IDBPDatabase<ISettingsSchema>>) {
    actionsBox.obs
        .pipe(
            filter((action) => !isNil(action)),
            map((action) => action as TSettingsSetter),
            switchMap((action) =>
                db$.pipe(
                    switchMap((db) => {
                        const storeName = getSettingsStoreName(action?.storeName);
                        const transaction = db.transaction(storeName, 'readwrite');

                        return from(
                            Promise.all([
                                isNil(action.value)
                                    ? transaction.store.delete(action.key)
                                    : transaction.store.put(action.value, action.key),
                                transaction.done,
                            ]),
                        ).pipe(
                            tap(() =>
                                updateMemoryValue(action.storeName, action.key, action.value),
                            ),
                        );
                    }),
                    progressiveRetry(),
                ),
            ),
        )
        .subscribe();
}
