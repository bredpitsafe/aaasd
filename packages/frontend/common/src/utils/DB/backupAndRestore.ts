import type { IDBPDatabase } from 'idb';
import { deleteDB, openDB } from 'idb';
import { intersection } from 'lodash-es';

type TDatabaseRowItem = {
    key: IDBValidKey;
    value: object;
};
type TDatabaseDump = Record<string, Array<TDatabaseRowItem>>;
type TStorageDump = Record<string, TDatabaseDump>;

async function exportIDBPToObject(db: IDBPDatabase): Promise<TDatabaseDump> {
    const storeNames = db.objectStoreNames;
    const res: TDatabaseDump = {};
    if (storeNames.length === 0) {
        return res;
    }
    const transaction = db.transaction(storeNames);

    for (const storeName of storeNames) {
        res[storeName] = [];
        const store = transaction.objectStore(storeName);
        let cursor = await store.openCursor();
        while (cursor) {
            const row = {
                key: cursor.key,
                value: cursor.value,
            };
            res[storeName].push(row);
            cursor = await cursor.continue();
        }
    }
    await transaction.done;
    return res;
}

async function importIDBPFromObject(db: IDBPDatabase, importObject: TDatabaseDump): Promise<void> {
    // Import only existing stores.
    // Trying to import other stores (i.e. from other applications) will result in an error.
    const storeNames = intersection(Object.keys(importObject), db.objectStoreNames);
    if (!storeNames.length) {
        return;
    }

    const transaction = db.transaction(storeNames);
    for (const storeName of storeNames) {
        for (const storeItem of importObject[storeName]) {
            await transaction.db.put(storeName, storeItem.value, storeItem.key);
        }
    }

    return transaction.done;
}

export async function exportAllIDBs(): Promise<TStorageDump> {
    const dbs = await indexedDB.databases();
    const res: TStorageDump = {};
    for (const dbInfo of dbs) {
        const db = await openDB(dbInfo.name!, dbInfo.version);
        res[db.name] = await exportIDBPToObject(db);
        db.close();
    }
    return res;
}

export async function importAllIDBs(dbs: TStorageDump): Promise<void> {
    for (const [name, value] of Object.entries(dbs)) {
        const db = await openDB(name);
        // DB is initially empty. That means we've just created it.
        // It should be removed since we can't create an object store in it anyway.
        if (db.objectStoreNames.length === 0) {
            db.close();
            await deleteDB(name);
        } else {
            await importIDBPFromObject(db, value);
            db.close();
        }
    }
}
