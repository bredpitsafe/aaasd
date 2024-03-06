import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TFail } from '@frontend/common/src/types/Fail';
import { CUSTOM_VIEW_VERSION } from '@frontend/common/src/utils/CustomView/defs';
import { prepareImportableGrid } from '@frontend/common/src/utils/CustomView/parse';
import type { TCustomViewCompiledGridContent } from '@frontend/common/src/utils/CustomView/parsers/defs';
import { hashString } from '@frontend/common/src/utils/hashString';
import { getNowMilliseconds } from '@frontend/common/src/utils/time';
import type { IDBPDatabase } from 'idb';
import { isEmpty, isNil } from 'lodash-es';
import { firstValueFrom, Observable } from 'rxjs';

import type { TCustomViewGridPanel } from '../../../types/panel';
import { convertPanelGridConfigToXml } from '../../../utils/panels/converters';
import { createCustomViewEmptyFail, createCustomViewParseError } from '../fails';
import type { ICustomViewSchema } from './db';

export function getCustomViewGrid(
    database$: Observable<IDBPDatabase<ICustomViewSchema>>,
    panelGrid: TCustomViewGridPanel['grid'],
    panelSettings: TCustomViewGridPanel['settings'],
): Observable<
    | TCustomViewCompiledGridContent
    | TFail<'[custom-view]: Empty'>
    | TFail<'[custom-view]: Parse Error', string>
> {
    return new Observable((subscriber) => {
        if (isNil(panelGrid) || isEmpty(panelGrid)) {
            subscriber.next(createCustomViewEmptyFail());
            subscriber.complete();
            return;
        }

        const xml = convertPanelGridConfigToXml(panelGrid);

        if (isEmpty(xml)) {
            subscriber.next(createCustomViewEmptyFail());
            subscriber.complete();
            return;
        }

        validateGridAndCache(database$, xml, panelSettings.url).then((result) => {
            subscriber.next(result);
            subscriber.complete();
        });
    });
}

async function validateGridAndCache(
    database$: Observable<IDBPDatabase<ICustomViewSchema>>,
    xml: string,
    url?: TSocketURL,
): Promise<
    | TCustomViewCompiledGridContent
    | TFail<'[custom-view]: Empty'>
    | TFail<'[custom-view]: Parse Error', string>
> {
    const configHash = String(hashString(xml));

    const db = await firstValueFrom(database$);
    const currentCache = await db.get('grid', configHash);

    if (!isNil(currentCache)) {
        if (currentCache.version === CUSTOM_VIEW_VERSION) {
            await upsertGrid(db, configHash, currentCache);
            return currentCache;
        }
        await deleteGrid(db, configHash);
    }

    try {
        const grid = prepareImportableGrid(xml, url)?.grid;

        if (isNil(grid)) {
            return createCustomViewEmptyFail();
        }

        await upsertGrid(db, configHash, grid);

        return grid;
    } catch (err) {
        return createCustomViewParseError((err as Error).message);
    }
}

async function upsertGrid(
    db: IDBPDatabase<ICustomViewSchema>,
    configHash: string,
    grid: TCustomViewCompiledGridContent,
) {
    const transaction = db.transaction('grid', 'readwrite');
    await Promise.all([
        transaction.store.put({ ...grid, touchUnixTimestamp: getNowMilliseconds() }, configHash),
        transaction.done,
    ]);
}

async function deleteGrid(db: IDBPDatabase<ICustomViewSchema>, configHash: string) {
    const transaction = db.transaction('grid', 'readwrite');
    await Promise.all([transaction.store.delete(configHash), transaction.done]);
}
