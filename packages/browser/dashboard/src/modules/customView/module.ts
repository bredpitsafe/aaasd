import { ModuleFactory } from '@frontend/common/src/di';

import { getCustomViewGrid } from './operations/getCustomViewGrid';
import { getCustomViewTable } from './operations/getCustomViewTable';
import { getCustomViewCacheDB$ } from './operations/utils';

function createModule() {
    const database$ = getCustomViewCacheDB$();

    return {
        getCustomViewGrid: getCustomViewGrid.bind(undefined, database$),
        getCustomViewTable: getCustomViewTable.bind(undefined, database$),
    };
}

export const ModuleCustomView = ModuleFactory(createModule);
