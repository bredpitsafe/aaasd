import { EApplicationName } from '@common/types';
import { createDB } from '@frontend/common/src/utils/DB/createDB';
import { getDatabaseVersion } from '@frontend/common/src/utils/DB/utils';
import type { TDatabaseErrorCallback } from '@frontend/common/src/utils/Rx/database';
import { EDatabaseErrorCallbackType } from '@frontend/common/src/utils/Rx/database';
import type { DBSchema, IDBPDatabase } from 'idb';

import type { ERequestQueryType } from '../types';

const DB_NAME = EApplicationName.WSQueryTerminal;

const currentSettingsDatabaseVersion = 1;

export type TDBRequestQuery = {
    key: number;
    value: {
        id: number;
        name: string;
        query: string;
        lastRequestTs: number;
        type: ERequestQueryType;
    };
    indexes: {
        id: number;
        name: string;
        lastRequestTs: number;
        type: ERequestQueryType;
    };
};

type TDBSchema = DBSchema & {
    request_query: TDBRequestQuery;
};

export async function getAppDb(
    dbCallback: TDatabaseErrorCallback,
): Promise<IDBPDatabase<TDBSchema>> {
    const requestedVersion = Math.max(
        (await getDatabaseVersion(DB_NAME)) ?? 0,
        currentSettingsDatabaseVersion,
    );

    return createDB<TDBSchema>(DB_NAME, requestedVersion, {
        blocked: () => dbCallback(EDatabaseErrorCallbackType.Blocked),
        blocking: () => dbCallback(EDatabaseErrorCallbackType.Blocking),
        terminated: () => dbCallback(EDatabaseErrorCallbackType.Terminated),
        upgrade(db: IDBPDatabase<TDBSchema>) {
            if (!db.objectStoreNames.contains('request_query')) {
                const reqQueryStorage = db.createObjectStore('request_query', {
                    keyPath: 'id',
                });
                reqQueryStorage.createIndex('name', 'name', { unique: false });
                reqQueryStorage.createIndex('lastRequestTs', 'lastRequestTs', { unique: false });
                reqQueryStorage.createIndex('type', 'type', { unique: false });
            }
        },
    });
}
