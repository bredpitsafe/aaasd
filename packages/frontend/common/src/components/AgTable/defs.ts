import type { ETableIds, TTableId } from '../../modules/clientTableFilters/data.ts';
import type { TAgTableProps } from './AgTable.tsx';

// AgGrid Custom Events
export const EVENT_GRID_FIRST_SERVER_DATA_RECEIVED = 'CUSTOM_EVENT_GRID_FIRST_SERVER_DATA_RECEIVED';
export const EVENT_GRID_VIEWPORT_COLUMNS_CHANGED = 'CUSTOM_EVENT_GRID_VIEWPORT_COLUMNS_CHANGED';

export type TAgTableWithRouterSyncProps<RecordType> = TAgTableProps<RecordType> & {
    id: ETableIds | TTableId;
    includeDefaultContextMenuItems?: boolean;
};
