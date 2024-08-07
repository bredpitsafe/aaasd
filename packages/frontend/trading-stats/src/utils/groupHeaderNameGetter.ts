import type { HeaderValueGetterFunc } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';

export const groupHeaderNameGetter: HeaderValueGetterFunc = (params) => {
    return (
        params.columnApi
            .getRowGroupColumns()
            .reduce((acc, col) => {
                const colDef = col.getColDef();
                const headerName = colDef.headerName ?? colDef.colId ?? colDef.field;
                if (!isNil(headerName)) {
                    acc.push(headerName);
                }
                return acc;
            }, [] as string[])
            .join('|') || 'Group'
    );
};
