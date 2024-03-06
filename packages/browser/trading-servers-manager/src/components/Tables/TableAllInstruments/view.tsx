import { PushpinOutlined } from '@ant-design/icons';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import {
    TableLabelExportData,
    TFieldInfo,
} from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { TableLabelSelect } from '@frontend/common/src/components/TableLabel/TableLabelSelect';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import type { TimeZone } from '@frontend/common/src/types/time';
import { assert } from '@frontend/common/src/utils/assert';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ColDef, ColGroupDef } from 'ag-grid-community/dist/lib/entities/colDef';
import { isFunction, isNil, isString } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { getColumns } from './columns';
import { useInstrumentKind } from './hooks/useInstrumentKind';
import { cnKindSelector, cnRoot } from './view.css';

type TableAllInstrumentsProps = {
    instruments: undefined | TInstrument[];
    exportFilename: string;
    timeZone: TimeZone;
};

export function TableAllInstruments(props: TableAllInstrumentsProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi<TInstrument>();
    const { kind, setKind, options } = useInstrumentKind(gridApi);
    const columns = useMemo(
        () => getColumns({ kind, timeZone: props.timeZone }),
        [kind, props.timeZone],
    );

    const {
        regExp,
        filterValid,
        templateExample,
        caseSensitive,
        setRegExp,
        toggleCaseSensitive,
        isExternalFilterPresent,
        doesExternalFilterPass,
    } = useRegExpTableFilter({
        tableId: ETableIds.AllInstruments,
        columns,
        gridApi,
    });

    const { getFilteredData, filteredCount } = useFilteredData(gridApi);
    const { onSelectionChanged, selectedRows } = useRowSelection<TInstrument>();

    const handleGetExportOptions = useFunction(() => getExportOptions(columns));

    return (
        <div className={cnRoot}>
            <TableLabels>
                <TableLabelRegExpFilter
                    inputPlaceholder={templateExample}
                    inputValue={regExp}
                    inputValid={filterValid}
                    onInputChange={setRegExp}
                    caseSensitive={caseSensitive}
                    onCaseSensitiveToggle={toggleCaseSensitive}
                />
                <TableLabelSelect
                    className={cnKindSelector}
                    icon={<PushpinOutlined />}
                    options={options}
                    value={kind}
                    placeholder="Inst. kind"
                    onChange={setKind}
                    allowClear
                />
                <TableLabelCount
                    title="Instruments"
                    count={props.instruments?.length}
                    filteredCount={filteredCount}
                />
                <TableLabelExportData
                    selectedRows={selectedRows}
                    getData={getFilteredData}
                    filename={props.exportFilename}
                    getOptions={handleGetExportOptions}
                />
            </TableLabels>
            <AgTableWithRouterSync
                id={ETableIds.AllInstruments}
                rowKey="id"
                rowData={props.instruments}
                columnDefs={columns}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                onGridReady={onGridReady}
                isExternalFilterPresent={isExternalFilterPresent}
                doesExternalFilterPass={doesExternalFilterPass}
                suppressColumnMoveAnimation
                // maintainColumnOrder
            />
        </div>
    );
}

function getExportOptions(columns: (ColDef<TInstrument> | ColGroupDef<TInstrument>)[]) {
    const fields = columns.flatMap((column) => prepareColumn(column));

    return { fields };

    function prepareColumn(
        column: ColDef<TInstrument> | ColGroupDef<TInstrument>,
        path = '',
    ): TFieldInfo<TInstrument> | TFieldInfo<TInstrument>[] {
        if ('children' in column) {
            const { headerName, children } = column;
            return children.flatMap((child) =>
                prepareColumn(
                    child as ColDef<TInstrument> | ColGroupDef<TInstrument>,
                    createHeaderName(path, headerName),
                ),
            );
        }
        if ('headerName' in column) {
            const { headerName, field, valueGetter } = column;
            return {
                label: createHeaderName(path, headerName),
                value:
                    field ??
                    (isFunction(valueGetter)
                        ? createValueGetterWrapper(valueGetter)
                        : valueGetter) ??
                    '',
            };
        }

        throw new Error('Unknown column type');
    }

    function createHeaderName(path: string, headerName = '') {
        return path === '' ? headerName : `${path} / ${headerName}`;
    }

    function createValueGetterWrapper(
        valueGetter: ColDef<TInstrument>['valueGetter'],
    ): (params: TInstrument) => unknown {
        return (data: TInstrument) => {
            assert(
                !isString(valueGetter),
                'String valueGetters are not supported by data export provider',
            );

            if (isNil(valueGetter)) {
                return '';
            }

            // @ts-ignore
            return valueGetter({ data }) ?? '';
        };
    }
}
