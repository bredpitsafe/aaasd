import type { EApplicationName, TStructurallyCloneable } from '@common/types';
import type { IDBPTransaction, TypedDOMStringList } from 'idb';
import { isEmpty } from 'lodash-es';

import type { TSetSettings } from './actions';
import type { ISettingsSchema } from './db';
import { createSettingsDB } from './db';

export async function getSettingsData(): Promise<TSetSettings[]> {
    const db = await createSettingsDB();
    const transaction = db.transaction(db.objectStoreNames, 'readonly');
    const resultToMigrate: TSetSettings[] = [];
    for (const name of db.objectStoreNames) {
        const storeSettings = await getAllObjectsFromObjectStore(transaction, name);
        if (!isEmpty(storeSettings)) {
            storeSettings.forEach((settings) => {
                resultToMigrate.push({
                    appName: name,
                    key: settings.key,
                    value: settings.value as TStructurallyCloneable,
                });
            });
        }
    }

    return resultToMigrate;
}

async function getAllObjectsFromObjectStore(
    tx: IDBPTransaction<ISettingsSchema, TypedDOMStringList<EApplicationName>, 'readonly'>,
    appName: EApplicationName,
) {
    const store = tx.objectStore(appName);

    const [objects, keys] = await Promise.all([store.getAll(), store.getAllKeys()]);

    return objects.map((obj, index) => ({ key: keys[index], value: obj }));
}
