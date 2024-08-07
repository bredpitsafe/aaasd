import type { ISO, Milliseconds, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { ColDef } from '@frontend/ag-grid';
import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { TProductLog } from '../../../modules/actions/productLogs/defs.ts';
import { EProductLogLevel } from '../../../modules/actions/productLogs/defs.ts';
import { ETableIds } from '../../../modules/clientTableFilters/data';
import type { TWithClassname } from '../../../types/components';
import { useFunction } from '../../../utils/React/useFunction';
import { throwingError } from '../../../utils/throwingError';
import { AgTableWithRouterSync } from '../../AgTable/AgTableWithRouterSync';
import { withReadOnlyEditor } from '../../AgTable/editors/ReadOnlyEditor';
import { dateFormatter } from '../../AgTable/formatters/date';
import { useFilteredData } from '../../AgTable/hooks/useFilteredData';
import { useGridApi } from '../../AgTable/hooks/useGridApi';
import type { TUseInfinityDataSourceProps } from '../../AgTable/hooks/useInfinityDataSource';
import { useInfinityDataSource } from '../../AgTable/hooks/useInfinityDataSource';
import { useRowSelection } from '../../AgTable/hooks/useRowSelection';
import type { TUseScrollCallbacksProps } from '../../AgTable/hooks/useScrollCallbacks';
import { useScrollCallbacks } from '../../AgTable/hooks/useScrollCallbacks';
import { isoGetter } from '../../AgTable/valueGetters/iso';
import { TableLabelLastUpdate } from '../../TableLabel/LastUpdate';
import { TableLabelExportData } from '../../TableLabel/TableLabelExportData';
import { TableLabelFiller } from '../../TableLabel/TableLabelFiller';
import { TableLabels } from '../../TableLabel/TableLabels';
import { FieldsView } from './FieldsView';
import { cnErrorRow, cnRoot, cnWarningRow } from './index.css';

type TColumnKey = keyof TProductLog;
type TDataType = { key?: number | string } & Pick<TProductLog, TColumnKey>;

export type TTableProductLogsProps = TWithClassname &
    TUseInfinityDataSourceProps<TProductLog> &
    TUseScrollCallbacksProps & {
        updateTime: undefined | Milliseconds;
        exportFilename: string;
        timeZone: TimeZone;
    };

export function TableProductLogs(props: TTableProductLogsProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi<TProductLog>();
    const { getFilteredData } = useFilteredData(gridApi);
    const { onSelectionChanged, selectedRows } = useRowSelection<TProductLog>();

    const infinityDataSourceProps = useInfinityDataSource(gridApi, props);

    useScrollCallbacks(gridApi, props);

    const columns = useMemo<ColDef<TDataType>[]>(
        () => createColumns(props.timeZone),
        [props.timeZone],
    );

    const getCSVOptions = useFunction(() => csvOptionsGetter(columns, props.timeZone));

    const rowClassRules = useMemo(() => getRowClassRules(), []);

    return (
        <div className={cn(props.className, cnRoot)}>
            <TableLabels>
                <TableLabelFiller />
                <TableLabelLastUpdate time={props.updateTime} timeZone={props.timeZone} />
                <TableLabelExportData<TProductLog>
                    filename={props.exportFilename}
                    getData={getFilteredData}
                    getOptions={getCSVOptions}
                    selectedRows={selectedRows}
                />
            </TableLabels>
            <AgTableWithRouterSync<TProductLog>
                id={ETableIds.ProductLogs}
                rowKey="fingerprint"
                columnDefs={columns}
                rowSelection="multiple"
                onGridReady={onGridReady}
                onSelectionChanged={onSelectionChanged}
                rowClassRules={rowClassRules}
                {...infinityDataSourceProps}
            />
        </div>
    );
}

export function getRowClassRules(): RowClassRules<TProductLog> {
    return {
        [cnWarningRow]: ({ data }: RowClassParams<TProductLog>) =>
            data?.level === EProductLogLevel.Warn,
        [cnErrorRow]: ({ data }: RowClassParams<TProductLog>) =>
            data?.level === EProductLogLevel.Error,
    };
}

function createColumns(timeZone: TimeZone): ColDef<TDataType>[] {
    return [
        {
            field: 'platformTime',
            headerName: 'Time',
            valueGetter: isoGetter(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTimeMilliseconds),
            sort: 'desc',
        },
        {
            field: 'level',
            headerName: 'Level',
        },
        {
            field: 'component',
        },
        {
            field: 'message',
            headerName: 'Message',
            suppressAutoSize: true,
            tooltipField: 'message',
            ...withReadOnlyEditor(),
        },
        {
            hide: true,
            field: 'actorKey',
            headerName: 'Actor Key',
        },
        {
            hide: true,
            field: 'actorGroup',
            headerName: 'Actor Group',
        },
        {
            hide: true,
            field: 'location',
            headerName: 'Location',
        },
        {
            hide: true,
            field: 'traceId',
            headerName: 'Trace ID',
        },
        {
            hide: true,
            field: 'dedupCount',
            headerName: 'Dedup. Count',
        },
        {
            hide: true,
            field: 'fields',
            cellRenderer: FieldsView,
        },
    ];
}

function csvOptionsGetter(columns: ColDef<TDataType>[], timeZone: TimeZone) {
    return {
        fields: columns.map(({ field }) => {
            switch (field) {
                case 'platformTime':
                    return createTimeField(field, 'Time', timeZone);
                case 'level':
                    return createField(field, 'Level');
                case 'component':
                    return createField(field, 'Component');
                case 'actorKey':
                    return createField(field, 'Actor Key');
                case 'actorGroup':
                    return createField(field, 'Actor Group');
                case 'message':
                    return createField(field, 'Message');
                case 'location':
                    return createField(field, 'Location');
                case 'traceId':
                    return createField(field, 'Trace Id');
                case 'fields':
                    return createField(field, 'Fields');
                case 'dedupCount':
                    return createField(field, 'Dedup. Count');
                default:
                    throwingError(`Missing field: "${field}"`);
            }
        }),
    };
}

function createField(key: string, label: string) {
    return {
        label,
        value: key,
    };
}

function createTimeField(key: TColumnKey, label: string, timeZone: TimeZone) {
    return {
        label,
        value: (row: TDataType) =>
            toDayjsWithTimezone(row[key] as ISO, timeZone).format(
                EDateTimeFormats.DateTimeMilliseconds,
            ),
    };
}
