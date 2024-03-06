import { CellClassParams } from 'ag-grid-community';

import { cnEditable } from './style.css';

export const cellClass = (params: CellClassParams) =>
    params.column.isCellEditable(params.node) ? cnEditable : undefined;
