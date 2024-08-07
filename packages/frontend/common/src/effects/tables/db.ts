import { scanPrevNext } from '@common/rx';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Observable } from 'rxjs';
import { from, merge, tap } from 'rxjs';
import { map } from 'rxjs/operators';

import { DYNAMIC_TABLE_NAME_PREFIX, ETableIds } from '../../modules/clientTableFilters/data';
import type { TTableState, TTableStatesMap } from '../../modules/tables/data';
import { boxTableStates } from '../../modules/tables/data';
import { removeTableState, upsertTableState } from '../../modules/tables/utils';
import { EMPTY_OBJECT } from '../../utils/const';
import { createDB } from '../../utils/DB/createDB';
import { getDatabaseVersion } from '../../utils/DB/utils';
import { deepDiff } from '../../utils/deepDiff';
import type { TDatabaseErrorCallback } from '../../utils/Rx/database';
import {
    broadcastChangesDB$,
    EDatabaseErrorCallbackType,
    incrementReadFromDB,
    incrementWriteToDB$,
    receiveChangesDB,
} from '../../utils/Rx/database';

export const tablesDatabaseName = 'tableStates' as const;
export const tablesStorageName = 'tableStates' as const;
const currentTablesDatabaseVersion = 1;

export interface ITablesSchema extends DBSchema {
    [tablesStorageName]: {
        key: ETableIds;
        value: TTableState;
    };
}

export async function createTableStateDB(
    dbCallback: TDatabaseErrorCallback,
): Promise<IDBPDatabase<ITablesSchema>> {
    const requestedVersion = Math.max(
        (await getDatabaseVersion(tablesDatabaseName)) ?? 0,
        currentTablesDatabaseVersion,
    );

    return createDB<ITablesSchema>(tablesDatabaseName, requestedVersion, {
        async blocked() {
            await dbCallback(EDatabaseErrorCallbackType.Blocked);
        },
        async blocking() {
            await dbCallback(EDatabaseErrorCallbackType.Blocking);
        },
        async terminated() {
            await dbCallback(EDatabaseErrorCallbackType.Terminated);
        },
        upgrade(database: IDBPDatabase<ITablesSchema>, oldVersion: number) {
            if (oldVersion < 1) {
                database.createObjectStore(tablesStorageName);
                return;
            }
        },
    });
}

export function loadTableState$(
    database: IDBPDatabase<ITablesSchema>,
): Observable<TTableStatesMap> {
    return from(database.getAll(tablesStorageName)).pipe(
        map((values) =>
            [
                ...Object.values(ETableIds),
                ...values
                    .filter(({ id }) => id?.startsWith(DYNAMIC_TABLE_NAME_PREFIX))
                    .map(({ id }) => id),
            ].reduce((acc, id) => {
                acc[id] = values.find((layout) => layout.id === id);
                return acc;
            }, {} as TTableStatesMap),
        ),
        tap((newTableStates) => {
            boxTableStates.set(newTableStates);
        }),
    );
}

export function syncTableStateChanges$(database: IDBPDatabase<ITablesSchema>): Observable<unknown> {
    return merge(
        boxTableStates.obs.pipe(
            scanPrevNext(),
            // @ts-ignore
            map(([prev, next]) => {
                return {
                    storageName: tablesStorageName,
                    source: next,
                    diffKeys: deepDiff(prev ?? EMPTY_OBJECT, next ?? EMPTY_OBJECT),
                };
            }),
            incrementWriteToDB$<ITablesSchema>(database),
            broadcastChangesDB$<ITablesSchema>(tablesStorageName),
        ),
        receiveChangesDB<ITablesSchema>(tablesStorageName).pipe(
            incrementReadFromDB<ITablesSchema>(database),
            tap((readResult) => {
                readResult.upsertedValues.forEach((item) => item && upsertTableState(item));
                readResult.deletedKeys.forEach((id) => removeTableState(id));
            }),
        ),
    );
}
