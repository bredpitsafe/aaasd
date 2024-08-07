import { PlusCircleOutlined } from '@ant-design/icons';
import type { DomLayoutType, RowDragEvent } from '@frontend/ag-grid';
import type { TColDef } from '@frontend/ag-grid/src/types';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useLocalGridState } from '@frontend/common/src/components/AgTable/hooks/useLocalGridState';
import { Button } from '@frontend/common/src/components/Button';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import { arrayMove } from '@frontend/common/src/utils/arrayMove';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isBoolean, isEmpty, isNumber, isUndefined } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo, useRef } from 'react';

import type { TChartPanelChartProps } from '../../../types/panel';
import type { THandleSetValidationError, TValueType } from '../../hooks/useChartsEditorFormSaver';
import {
    getColumnColor,
    getColumnDelete,
    getColumnFormula,
    getColumnGroup,
    getColumnLabel,
    getColumnLabelFormat,
    getColumnLegend,
    getColumnOpacity,
    getColumnQuery,
    getColumnType,
    getColumnVisible,
    getColumnWidth,
    getColumnYAxis,
} from './columns';
import type { TFieldUpdater } from './fieldUpdaterFactory';
import { cnTable } from './index.css';

type TableChartEditorProps = TWithClassname &
    TWithStyle & {
        charts: TChartPanelChartProps[];
        domLayout?: DomLayoutType;
        onAdd: () => unknown;
        onDelete: (id: TChartPanelChartProps['id']) => unknown;
        onChange: (
            chartId: TChartPanelChartProps['id'],
            field: keyof TChartPanelChartProps,
            value: TValueType,
        ) => void;
        onSort: (charts: TChartPanelChartProps[]) => unknown;
        onSetError: THandleSetValidationError;
    };

export function TableChartsEditor(props: TableChartEditorProps): ReactElement {
    const { gridApi, columnApi, onGridReady } = useGridApi<TChartPanelChartProps>();

    const fieldUpdater: TFieldUpdater = useFunction(async (field, id, value) => {
        const convertedValue =
            isEmpty(value) && !isBoolean(value) && !isNumber(value) ? undefined : value;

        await props.onChange(id, field, convertedValue);
    });

    const columns = useMemo(() => {
        return [
            {
                colId: 'drag',
                headerName: '',
                headerComponent: () => (
                    <Button
                        type="text"
                        size="small"
                        style={{ marginRight: 8 }}
                        icon={<PlusCircleOutlined />}
                        onClick={props.onAdd}
                    />
                ),
                field: 'id',
                valueFormatter: () => '',
                maxWidth: 42,
                rowDrag: true,
                sortable: false,
                filter: false,
                resizable: false,
                suppressMovable: true,
            },
            getColumnQuery(fieldUpdater),
            getColumnLabel(fieldUpdater),
            getColumnLabelFormat(fieldUpdater),
            getColumnType(fieldUpdater),
            getColumnColor(fieldUpdater),
            getColumnOpacity(fieldUpdater),
            getColumnWidth(fieldUpdater),
            getColumnVisible(fieldUpdater),
            getColumnLegend(fieldUpdater),
            getColumnYAxis(fieldUpdater),
            getColumnGroup(fieldUpdater),
            getColumnFormula(fieldUpdater, props.onSetError),
            getColumnDelete(props.onDelete),
        ] as TColDef<TChartPanelChartProps>[];
    }, [fieldUpdater, props.onAdd, props.onDelete, props.onSetError]);

    const dragStartIndex = useRef(-1);

    const onRowDragEnter = useFunction((event: RowDragEvent<TChartPanelChartProps>) => {
        dragStartIndex.current = event.node.rowIndex ?? -1;
    });

    const onRowDragLeave = useFunction(() => {
        dragStartIndex.current = -1;
    });

    const onRowDragEnd = useFunction((event: RowDragEvent<TChartPanelChartProps>) => {
        if (
            !isUndefined(props.charts) &&
            dragStartIndex.current !== -1 &&
            event.overIndex !== null &&
            dragStartIndex.current !== event.overIndex
        ) {
            props.onSort(
                arrayMove(
                    props.charts,
                    dragStartIndex.current,
                    event.overIndex === -1 ? props.charts.length - 1 : event.overIndex,
                ),
            );
        }
    });

    useLocalGridState(ETableIds.DashboardPanelChartProps, gridApi, columnApi);

    return (
        <AgTable<TChartPanelChartProps>
            className={cn(cnTable, props.className)}
            rowKey="id"
            rowData={props.charts}
            rowHeight={27}
            columnDefs={columns}
            animateRows
            rowDragManaged
            onRowDragEnter={onRowDragEnter}
            onRowDragEnd={onRowDragEnd}
            onRowDragLeave={onRowDragLeave}
            onGridReady={onGridReady}
            domLayout={props.domLayout}
        />
    );
}
