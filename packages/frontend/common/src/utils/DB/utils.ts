import type { DBSchema, StoreKey, StoreNames, StoreValue } from 'idb';
import type { IDBPTransaction } from 'idb/build/entry';

export async function getDatabaseVersion(databaseName: string): Promise<undefined | number> {
    // Localforage can increment database version https://localforage.github.io/localForage/
    // As it is impossible to connect to database with higher version https://developer.mozilla.org/en-US/docs/Web/API/DOMException
    // get current version of the database which can be incremented by Localforage
    try {
        const databases = await self.indexedDB.databases();
        const panelsDatabase = databases.find(({ name }) => name === databaseName);
        return panelsDatabase?.version;
    } catch (error) {
        return undefined;
    }
}

export function readDatabaseItem<TSchema extends DBSchema>(
    transaction: IDBPTransaction<TSchema, [StoreNames<TSchema>], 'readonly'>,
    key: StoreKey<TSchema, StoreNames<TSchema>>,
): Promise<StoreValue<TSchema, StoreNames<TSchema>> | undefined> {
    return transaction.store.get(key);
}

export function readDatabaseItems<TSchema extends DBSchema>(
    transaction: IDBPTransaction<TSchema, [StoreNames<TSchema>], 'readonly'>,
    keys: StoreKey<TSchema, StoreNames<TSchema>>[],
): Promise<StoreValue<TSchema, StoreNames<TSchema>> | undefined>[] {
    return keys.map((key) => transaction.store.get(key));
}

export function updateDatabaseItem<TSchema extends DBSchema>(
    transaction: IDBPTransaction<TSchema, [StoreNames<TSchema>], 'readwrite'>,
    key: StoreKey<TSchema, StoreNames<TSchema>>,
    item: StoreValue<TSchema, StoreNames<TSchema>>,
): Promise<StoreKey<TSchema, StoreNames<TSchema>>> {
    return transaction.store.put(item, key);
}

export function updateDatabaseItems<TSchema extends DBSchema>(
    transaction: IDBPTransaction<TSchema, [StoreNames<TSchema>], 'readwrite'>,
    entities: [StoreKey<TSchema, StoreNames<TSchema>>, StoreValue<TSchema, StoreNames<TSchema>>][],
): Promise<StoreKey<TSchema, StoreNames<TSchema>>>[] {
    return entities.map(([key, item]) => updateDatabaseItem(transaction, key, item));
}

export function deleteDatabaseItem<TSchema extends DBSchema>(
    transaction: IDBPTransaction<TSchema, [StoreNames<TSchema>], 'readwrite'>,
    key: StoreKey<TSchema, StoreNames<TSchema>>,
): Promise<void> {
    return transaction.store.delete(key);
}

export function deleteDatabaseItems<TSchema extends DBSchema>(
    transaction: IDBPTransaction<TSchema, [StoreNames<TSchema>], 'readwrite'>,
    keys: StoreKey<TSchema, StoreNames<TSchema>>[],
): Promise<void>[] {
    return keys.map((key) => transaction.store.delete(key));
}
