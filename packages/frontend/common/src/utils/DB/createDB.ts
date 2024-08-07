import type { DBSchema } from 'idb';
import { openDB } from 'idb';
import type { IDBPDatabase, OpenDBCallbacks } from 'idb/build/entry';

import { logger } from '../Tracing';

export function createDB<Schema extends DBSchema>(
    dbName: string,
    version: number,
    { upgrade, blocked, blocking, terminated }: OpenDBCallbacks<Schema> = {},
): Promise<IDBPDatabase<Schema>> {
    return openDB<Schema>(dbName, version, {
        upgrade,
        blocking(...args) {
            blocking?.(...args);
            logger.error(new Error(`IndexedDB ${dbName}: blocking`));
        },
        blocked(...args) {
            blocked?.(...args);
            logger.error(new Error(`IndexedDB ${dbName}: blocked`));
        },
        terminated() {
            terminated?.();
            logger.error(new Error(`IndexedDB ${dbName}: abnormally terminated the connection`));
        },
    }).then((db) => {
        db.onversionchange = (e) => {
            // Triggered when the database is modified (e.g. adding an objectStore) or
            // deleted (even when initiated by other sessions in different tabs).
            // Closing the connection here prevents those operations from being blocked.
            // If the database is accessed again later by this instance, the connection
            // will be reopened or the database recreated as needed.
            // @ts-ignore
            e.target.close();
        };

        return db;
    });
}
