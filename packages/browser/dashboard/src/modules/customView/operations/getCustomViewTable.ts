import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TFail } from '@frontend/common/src/types/Fail';
import { CUSTOM_VIEW_VERSION } from '@frontend/common/src/utils/CustomView/defs';
import { prepareImportableTable } from '@frontend/common/src/utils/CustomView/parse';
import type { TCustomViewCompiledTableContent } from '@frontend/common/src/utils/CustomView/parsers/defs';
import { hashString } from '@frontend/common/src/utils/hashString';
import { getNowMilliseconds } from '@frontend/common/src/utils/time';
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
): Observable<
    | TCustomViewCompiledTableContent
    | TFail<'[custom-view]: Empty'>
    | TFail<'[custom-view]: Parse Error', string>
> {
    return new Observable((subscriber) => {
        if (isNil(panelTable) || isEmpty(panelTable)) {
            subscriber.next(createCustomViewEmptyFail());
            subscriber.complete();
            return;
        }

        const xml = convertPanelTableConfigToXml(panelTable);

        if (isEmpty(xml)) {
            subscriber.next(createCustomViewEmptyFail());
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
): Promise<
    | TCustomViewCompiledTableContent
    | TFail<'[custom-view]: Empty'>
    | TFail<'[custom-view]: Parse Error', string>
> {
    const configHash = String(hashString(xml));

    const db = await firstValueFrom(database$);
    const currentCache = await db.get('table', configHash);

    if (!isNil(currentCache)) {
        if (currentCache.version === CUSTOM_VIEW_VERSION) {
            await upsertTable(db, configHash, currentCache);
            return currentCache;
        }
        await deleteTable(db, configHash);
    }

    try {
        const table = prepareImportableTable(xml, url)?.table;

        if (isNil(table)) {
            return createCustomViewEmptyFail();
        }

        await upsertTable(db, configHash, table);

        return table;
    } catch (err) {
        return createCustomViewParseError((err as Error).message);
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
