import { isNil } from 'lodash-es';

import type { GridApi } from './ag-grid-community.ts';

export function getSelectedRowsWithOrder<T>(api: GridApi<T>): T[] {
    const nodes = api
        .getSelectedNodes()
        .sort((left, right) => (left.rowIndex ?? 0) - (right.rowIndex ?? 0));

    return nodes.map(({ data }) => data).filter((data): data is T => !isNil(data));
}
