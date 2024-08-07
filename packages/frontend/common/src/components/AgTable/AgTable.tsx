import '@frontend/ag-grid/src/styles/default';

import type {
    ColDef,
    ColumnVisibleEvent,
    GetRowIdFunc,
    GetRowIdParams,
    GridOptions,
    GridReadyEvent,
} from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { AgGridReact } from 'ag-grid-react';
import cn from 'classnames';
import { isNull } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { TWithClassname } from '../../types/components';
import { isBrowser } from '../../utils/environment';
import { useFunction } from '../../utils/React/useFunction';
import { cnTable } from './AgTable.css';
import { MenuHeader } from './Header';
import { useCellKeyPressHandle } from './hooks/useCellKeyPressHandle';
import { useGetMainMenuItems } from './hooks/useGetMainMenuItems';
import { useGridApi } from './hooks/useGridApi';
import { useDefaultGridOverlayBehavior } from './hooks/useGridOverlay';
import { getCellValue } from './utils';

export type TAgTableProps<RecordType> = TWithClassname &
    GridOptions<RecordType> &
    (
        | {
              rowKey: keyof RecordType;
          }
        | { rowKey?: undefined; getRowId: GetRowIdFunc<RecordType> }
    );

const DEFAULT_ROW_HEIGHT = 24;
const DEFAULT_TOOLTIP_SHOW_DELAY = 500;

// TODO: doesnt't work inside prerendered components in Next.js environment
const GRID_CONTEXT_MENU_PARENT = isBrowser() ? document.body : undefined;

export function AgTable<RecordType>(props: TAgTableProps<RecordType>): ReactElement {
    const { className, rowKey, rowData, defaultColDef, getRowId, onGridReady, ...restProps } =
        props;

    const defaultColDefWithPredefined: ColDef<RecordType> = useMemo(
        () => ({
            resizable: true,
            sortable: true,
            filter: EColumnFilterType.text,
            flex: 1,
            minWidth: 50,
            cellEditorParams: {},
            ...defaultColDef,
        }),
        [defaultColDef],
    );

    const components = useMemo(() => {
        return {
            agColumnHeader: MenuHeader,
        };
    }, []);

    const getRowIdWithRowKey = useMemo<GetRowIdFunc | undefined>(() => {
        return rowKey !== undefined
            ? (params: GetRowIdParams<RecordType>) => String(params.data[rowKey!])
            : getRowId;
    }, [rowKey, getRowId]);

    const { gridApi, onGridReady: onGridReadyApi } = useGridApi<RecordType>();

    const cbGridReady = useFunction((event: GridReadyEvent<RecordType>) => {
        onGridReadyApi(event);
        onGridReady?.(event);
    });

    const preventLastVisibleColumnHiding = useFunction((e: ColumnVisibleEvent<RecordType>) => {
        const column = e.column;
        const columns = e.columnApi.getAllGridColumns();
        const hasVisibleColumn = columns.some((c) => c.isVisible());
        if (!hasVisibleColumn && !isNull(column)) {
            e.columnApi.setColumnsVisible([column], true);
        }
    });

    const getMainMenuItems = useGetMainMenuItems();
    const cellKeyPressHandle = useCellKeyPressHandle<RecordType>(props.onCellKeyDown);

    useDefaultGridOverlayBehavior(gridApi, rowData);

    return (
        <div className={cn('ag-theme-alpine', className, cnTable)}>
            <AgGridReact<RecordType>
                defaultColDef={defaultColDefWithPredefined}
                getRowId={getRowIdWithRowKey}
                rowHeight={DEFAULT_ROW_HEIGHT}
                components={components}
                onGridReady={cbGridReady}
                processCellForClipboard={getCellValue}
                onCellKeyDown={cellKeyPressHandle}
                getMainMenuItems={getMainMenuItems}
                tooltipShowDelay={DEFAULT_TOOLTIP_SHOW_DELAY}
                popupParent={GRID_CONTEXT_MENU_PARENT}
                rowGroupPanelShow="onlyWhenGrouping"
                groupDisplayType="multipleColumns"
                onColumnVisible={preventLastVisibleColumnHiding}
                rowData={rowData}
                {...restProps}
            />
        </div>
    );
}
