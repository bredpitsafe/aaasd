import type { IDBPDatabase } from 'idb';
import { isNil } from 'lodash-es';
import { distinctUntilChanged, from, merge, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';

import { createDatabase$, databaseReconnect, logDatabaseError } from '../../utils/Rx/database';
import type { TSettingsSetter } from './actions';
import { createSettingsDB, ISettingsSchema, TSettingsStoreName } from './db';
import { actionsBox, settingsMapBox } from './store';

export function getSettingsDB$(): Observable<IDBPDatabase<ISettingsSchema>> {
    return createDatabase$<ISettingsSchema>(createSettingsDB).pipe(
        logDatabaseError(),
        databaseReconnect(),
        shareReplay(),
    );
}

export function getSettingsStoreName(name: undefined | TSettingsStoreName): TSettingsStoreName {
    return name ?? 'common';
}

export function updateMemoryValue<T>(name: undefined | TSettingsStoreName, key: string, value: T) {
    const applicationDBName = getSettingsStoreName(name);
    const existingSettings = settingsMapBox.get();
    settingsMapBox.set({
        ...existingSettings,
        [applicationDBName]: {
            ...existingSettings[applicationDBName],
            [key]: value,
        },
    });
}

export function getSettings<T>(
    db$: Observable<IDBPDatabase<ISettingsSchema>>,
    name: TSettingsStoreName | undefined,
    key: string,
): Observable<T> {
    const applicationDBName = getSettingsStoreName(name);

    const actionValues$ = actionsBox.obs.pipe(
        filter(
            (action): action is TSettingsSetter =>
                !isNil(action) && action.storeName === name && action.key === key,
        ),
    );

    const cacheValues$ = merge(
        settingsMapBox.obs.pipe(
            map(({ [applicationDBName]: applicationSettings }) => applicationSettings),
            filter(
                (
                    applicationSettings,
                ): applicationSettings is Record<
                    TSettingsSetter['key'],
                    TSettingsSetter['value']
                > => !isNil(applicationSettings) && key in applicationSettings,
            ),
            map((applicationSettings) => applicationSettings[key] as T),
            takeUntil(actionValues$),
            take(1),
        ),
        actionValues$.pipe(map((action) => action.value as T)),
    );

    const existingSettings = settingsMapBox.get();

    if (applicationDBName in existingSettings) {
        if (key in existingSettings[applicationDBName]!) {
            return cacheValues$.pipe(distinctUntilChanged());
        }
    } else {
        settingsMapBox.set({ ...existingSettings, [applicationDBName]: {} });
    }

    return merge(
        db$.pipe(
            switchMap((db) =>
                from(db.get(applicationDBName, key) as Promise<T>).pipe(
                    tap((value) => updateMemoryValue(name, key, value)),
                ),
            ),
            take(1),
            takeUntil(actionValues$),
        ),
        cacheValues$,
    ).pipe(distinctUntilChanged());
}
