import {
    createDatabase$,
    databaseReconnect,
    logDatabaseError,
} from '@frontend/common/src/utils/Rx/database';
import type { IDBPDatabase } from 'idb';
import type { Observable } from 'rxjs';
import { shareReplay } from 'rxjs';

import type { ICustomViewSchema } from './db';
import { createCustomViewCacheDB } from './db';

export function getCustomViewCacheDB$(): Observable<IDBPDatabase<ICustomViewSchema>> {
    return createDatabase$<ICustomViewSchema>(createCustomViewCacheDB).pipe(
        logDatabaseError(),
        databaseReconnect(),
        shareReplay(),
    );
}
