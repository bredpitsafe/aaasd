import type { Milliseconds } from '@common/types';
import type {
    TCustomViewCompiledGridContent,
    TCustomViewCompiledTableContent,
} from '@frontend/common/src/utils/CustomView/parsers/defs';
import { createDB } from '@frontend/common/src/utils/DB/createDB';
import { getDatabaseVersion } from '@frontend/common/src/utils/DB/utils';
import type { TDatabaseErrorCallback } from '@frontend/common/src/utils/Rx/database';
import { EDatabaseErrorCallbackType } from '@frontend/common/src/utils/Rx/database';
import type { DBSchema, IDBPDatabase } from 'idb';

const customViewCacheDatabaseName = 'CUSTOM_VIEW_CACHE' as const;

const currentSettingsDatabaseVersion = 1;

type TCustomViewCacheGrid = {
    key: string;
    value: TCustomViewCompiledGridContent & {
        touchUnixTimestamp: Milliseconds;
    };
    indexes: { 'by-touch-unix-timestamp': Milliseconds };
};

type TCustomViewCacheTable = {
    key: string;
    value: TCustomViewCompiledTableContent & {
        touchUnixTimestamp: Milliseconds;
    };
    indexes: { 'by-touch-unix-timestamp': Milliseconds };
};

export type ICustomViewSchema = DBSchema & {
    grid: TCustomViewCacheGrid;
    table: TCustomViewCacheTable & {
        touchUnixTimestamp: Milliseconds;
    };
};

export async function createCustomViewCacheDB(
    dbCallback: TDatabaseErrorCallback,
): Promise<IDBPDatabase<ICustomViewSchema>> {
    const requestedVersion = Math.max(
        (await getDatabaseVersion(customViewCacheDatabaseName)) ?? 0,
        currentSettingsDatabaseVersion,
    );

    return createDB<ICustomViewSchema>(customViewCacheDatabaseName, requestedVersion, {
        blocked: () => dbCallback(EDatabaseErrorCallbackType.Blocked),
        blocking: () => dbCallback(EDatabaseErrorCallbackType.Blocking),
        terminated: () => dbCallback(EDatabaseErrorCallbackType.Terminated),
        upgrade(database: IDBPDatabase<ICustomViewSchema>) {
            for (const storeName of ['grid', 'table'] as ['grid', 'table']) {
                const store = database.createObjectStore(storeName);
                store.createIndex('by-touch-unix-timestamp', 'touchUnixTimestamp');
            }
        },
    });
}
