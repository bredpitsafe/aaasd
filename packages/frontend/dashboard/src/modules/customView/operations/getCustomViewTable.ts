import type { Nil } from '@common/types';
import { getNowMilliseconds } from '@common/utils';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { CUSTOM_VIEW_VERSION } from '@frontend/common/src/utils/CustomView/defs';
import { prepareImportableTable } from '@frontend/common/src/utils/CustomView/parse';
import type { TCustomViewCompiledTableContent } from '@frontend/common/src/utils/CustomView/parsers/defs';
import { hashString } from '@frontend/common/src/utils/hashString';
import { logger } from '@frontend/common/src/utils/Tracing';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { IDBPDatabase } from 'idb';
import { isEmpty, isNil } from 'lodash-es';
import { firstValueFrom, Observable } from 'rxjs';

import type { TCustomViewTablePanel } from '../../../types/panel';
import { convertPanelTableConfigToXml } from '../../../utils/panels/converters';
import { createCustomViewEmptyFail, createCustomViewParseError } from '../fails';
import type { ICustomViewSchema } from './db';

export function getCustomViewTable(
    database$: Observable<IDBPDatabase<ICustomViewSchema>>,
    panelTable: TCustomViewTablePanel['table'],
    panelSettings: TCustomViewTablePanel['settings'],
): Observable<TValueDescriptor2<TCustomViewCompiledTableContent>> {
    return new Observable((subscriber) => {
        if (isEmpty(panelTable)) {
            subscriber.next(
                createUnsyncedValueDescriptor(createCustomViewEmptyFail('Panel Table is empty')),
            );
            subscriber.complete();
            return;
        }

        const xml = convertPanelTableConfigToXml(panelTable);

        if (isEmpty(xml)) {
            subscriber.next(
                createUnsyncedValueDescriptor(
                    createCustomViewEmptyFail('Converted Panel Table is empty'),
                ),
            );
            subscriber.complete();
            return;
        }

        validateTableAndCache(database$, xml, panelSettings.url).then((result) => {
            subscriber.next(result);
            subscriber.complete();
        });
    });
}

async function validateTableAndCache(
    database$: Observable<IDBPDatabase<ICustomViewSchema>>,
    xml: string,
    url?: TSocketURL,
): Promise<TValueDescriptor2<TCustomViewCompiledTableContent>> {
    const configHash = String(hashString(xml));

    const db = await firstValueFrom(database$);
    const currentCache = await db.get('table', configHash);

    if (!isNil(currentCache)) {
        if (currentCache.version === CUSTOM_VIEW_VERSION) {
            await upsertTable(db, configHash, currentCache);
            return createSyncedValueDescriptor(currentCache);
        }
        await deleteTable(db, configHash);
    }

    try {
        const table = prepareImportableTable(xml, url)?.table;

        if (isNil(table)) {
            return createUnsyncedValueDescriptor(
                createCustomViewEmptyFail('Importable Table is empty'),
            );
        }

        await upsertTable(db, configHash, table);

        return createSyncedValueDescriptor(table);
    } catch (err) {
        const error = err as Error | Nil;
        const message = `CustomView Table: ${error?.message ?? 'Parse error'}`;

        logger.error({
            message,
            error,
        });

        return createUnsyncedValueDescriptor(createCustomViewParseError(message));
    }
}

async function upsertTable(
    db: IDBPDatabase<ICustomViewSchema>,
    configHash: string,
    table: TCustomViewCompiledTableContent,
) {
    const transaction = db.transaction('table', 'readwrite');
    await Promise.all([
        transaction.store.put({ ...table, touchUnixTimestamp: getNowMilliseconds() }, configHash),
        transaction.done,
    ]);
}

async function deleteTable(db: IDBPDatabase<ICustomViewSchema>, configHash: string) {
    const transaction = db.transaction('table', 'readwrite');
    await Promise.all([transaction.store.delete(configHash), transaction.done]);
}
