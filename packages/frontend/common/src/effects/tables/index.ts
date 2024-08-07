import { mapTo, switchMap } from 'rxjs';

import { createDatabase$, databaseReconnect, logDatabaseError } from '../../utils/Rx/database';
import { createTableStateDB, loadTableState$, syncTableStateChanges$ } from './db';

export function initTableStatesEffects(): void {
    createDatabase$(createTableStateDB)
        .pipe(
            logDatabaseError(),
            databaseReconnect(),
            switchMap((database) => loadTableState$(database).pipe(mapTo(database))),
            switchMap((database) => syncTableStateChanges$(database)),
        )
        .subscribe();
}
