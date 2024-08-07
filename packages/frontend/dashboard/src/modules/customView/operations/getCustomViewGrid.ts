import type { Nil } from '@common/types';
import { getNowMilliseconds } from '@common/utils';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { CUSTOM_VIEW_VERSION } from '@frontend/common/src/utils/CustomView/defs';
import { prepareImportableGrid } from '@frontend/common/src/utils/CustomView/parse';
import type { TCustomViewCompiledGridContent } from '@frontend/common/src/utils/CustomView/parsers/defs';
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

import type { TCustomViewGridPanel } from '../../../types/panel';
import { convertPanelGridConfigToXml } from '../../../utils/panels/converters';
import { createCustomViewEmptyFail, createCustomViewParseError } from '../fails';
import type { ICustomViewSchema } from './db';

export function getCustomViewGrid(
    database$: Observable<IDBPDatabase<ICustomViewSchema>>,
    panelGrid: TCustomViewGridPanel['grid'],
    panelSettings: TCustomViewGridPanel['settings'],
): Observable<TValueDescriptor2<TCustomViewCompiledGridContent>> {
    return new Observable((subscriber) => {
        if (isEmpty(panelGrid)) {
            subscriber.next(
                createUnsyncedValueDescriptor(createCustomViewEmptyFail('Panel Grid is empty')),
            );
            subscriber.complete();
            return;
        }

        const xml = convertPanelGridConfigToXml(panelGrid);

        if (isEmpty(xml)) {
            subscriber.next(
                createUnsyncedValueDescriptor(
                    createCustomViewEmptyFail('Converted Panel Grid is empty'),
                ),
            );
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
): Promise<TValueDescriptor2<TCustomViewCompiledGridContent>> {
    const configHash = String(hashString(xml));

    const db = await firstValueFrom(database$);
    const currentCache = await db.get('grid', configHash);

    if (!isNil(currentCache)) {
        if (currentCache.version === CUSTOM_VIEW_VERSION) {
            await upsertGrid(db, configHash, currentCache);
            return createSyncedValueDescriptor(currentCache);
        }
        await deleteGrid(db, configHash);
    }

    try {
        const grid = prepareImportableGrid(xml, url)?.grid;

        if (isNil(grid)) {
            return createUnsyncedValueDescriptor(
                createCustomViewEmptyFail('Importable Grid is empty'),
            );
        }

        await upsertGrid(db, configHash, grid);

        return createSyncedValueDescriptor(grid);
    } catch (err) {
        const error = err as Error | Nil;
        const message = `CustomView Grid: ${error?.message ?? 'Parse error'}`;

        logger.error({
            message,
            error,
        });

        return createUnsyncedValueDescriptor(createCustomViewParseError(message));
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
