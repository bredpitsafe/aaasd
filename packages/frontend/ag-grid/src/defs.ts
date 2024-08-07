import type { ColDef } from './ag-grid-community';

export const DATE_TIME_COL_SIZE: Readonly<
    Pick<ColDef, 'minWidth' | 'maxWidth'> & { resizable: false }
> = {
    minWidth: 165,
    maxWidth: 165,
    resizable: false,
};

export const TIME_COL_SIZE: Readonly<Pick<ColDef, 'minWidth' | 'maxWidth'> & { resizable: false }> =
    {
        minWidth: 80,
        maxWidth: 80,
        resizable: false,
    };
