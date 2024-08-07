import type { CellClassParams } from '@frontend/ag-grid';

import { cnEditable } from './style.css';

export const cellClass = (params: CellClassParams) =>
    params.column.isCellEditable(params.node) ? cnEditable : undefined;
