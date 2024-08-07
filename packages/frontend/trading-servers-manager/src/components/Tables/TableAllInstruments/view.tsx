import type { TimeZone } from '@common/types';
import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import type { ColDef, ColGroupDef } from '@frontend/ag-grid';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRegExpFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpFilter';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import type { TFieldInfo } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSubscribeToInstrumentsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToInstrumentsOnCurrentStage.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isFunction, isNil, isString } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { cnRoot } from '../view.css';
import { getColumns, STATUS_FILTER_OPTIONS } from './columns';
import { useKindFilter } from './hooks/useKindFilter';
import { useStatusFilter } from './hooks/useStatusFilter';

type TableAllInstrumentsProps = {
    exportFilename: string;
    timeZone: TimeZone;
};

export function TableAllInstruments(props: TableAllInstrumentsProps): ReactElement {
    const subscribeToInstruments = useModule(ModuleSubscribeToInstrumentsOnCurrentStage);

    const { gridApi, onGridReady } = useGridApi<TInstrument>();
    const { selectedStatuses, selectedStatusesNotInitedYet } = useStatusFilter();
    const { selectedKinds } = useKindFilter();
    const columns = useMemo(
        () => getColumns(selectedKinds, props.timeZone),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedKinds?.toString(), props.timeZone],
    );

    const {
        serverRegex,
        editableRegex: regExp,
        changeRegExp: setRegExp,
        filterValid,
        caseSensitive,
        toggleCaseSensitive,
    } = useRegExpFilter(`${ETableIds.AllInstruments}_external_filters`);

    const { getFilteredData, filteredCount } = useFilteredData(gridApi);
    const { onSelectionChanged, selectedRows } = useRowSelection<TInstrument>();

    const handleGetExportOptions = useFunction(() => getExportOptions(columns));

    const instruments = useNotifiedValueDescriptorObservable(
        selectedStatusesNotInitedYet
            ? EMPTY
            : subscribeToInstruments(
                  {
                      statuses: selectedStatuses || STATUS_FILTER_OPTIONS,
                      nameRegexes: isNil(serverRegex) ? undefined : [serverRegex],
                  },
                  { traceId: generateTraceId() },
              ),
    );

    return (
        <div className={cnRoot}>
            <TableLabels>
                <TableLabelRegExpFilter
                    inputPlaceholder="Name Regexp"
                    inputValue={regExp}
                    inputValid={filterValid}
                    onInputChange={setRegExp}
                    caseSensitive={caseSensitive}
                    onCaseSensitiveToggle={toggleCaseSensitive}
                />
                <TableLabelCount
                    title="Instruments"
                    count={instruments.value?.length}
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
                rowData={instruments.value}
                columnDefs={columns}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                onGridReady={onGridReady}
                suppressColumnMoveAnimation
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
