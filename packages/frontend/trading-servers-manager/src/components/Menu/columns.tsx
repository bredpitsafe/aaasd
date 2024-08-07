import type { ISO, TimeZone } from '@common/types';
import type { ColDef, ICellRendererParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import type { TWithBuildInfo } from '@frontend/common/src/types/domain/buildInfo';
import { EComponentStatus } from '@frontend/common/src/types/domain/component';
import type { TServer } from '@frontend/common/src/types/domain/servers';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { BuildInfo } from './BuildInfo/view';
import { KindWithCellRenderer } from './Components/KindWithCellRenderer';
import type { TComponentDataType } from './Components/view';
import { ComponentStatus } from './ComponentStatus';

type TStatusColumnData = TWithBuildInfo & {
    status: EComponentStatus;
    statusMessage: string | null;
    startTime?: ISO;
    dirty?: boolean;
};

export function getStatusColumn(timeZone: TimeZone): ColDef<TStatusColumnData> {
    const valueGetter = ({ data }: ValueGetterParams<TStatusColumnData>) => {
        return (
            data && AgValue.create(data.status, data, ['statusMessage', 'buildInfo', 'startTime'])
        );
    };
    return {
        colId: 'status',
        headerName: 'Status',
        enableRowGroup: true,
        filter: EColumnFilterType.set,
        filterParams: {
            values: Object.values(EComponentStatus),
        },
        width: 60,
        resizable: false,
        flex: 0,
        suppressSizeToFit: true,
        suppressAutoSize: true,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: ({ value }: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            return (
                <>
                    {value ? (
                        <ComponentStatus
                            status={value.payload}
                            statusMessage={value.data?.statusMessage}
                        />
                    ) : null}

                    <BuildInfo
                        buildInfo={value?.data?.buildInfo}
                        timeZone={timeZone}
                        startTime={value?.data?.startTime}
                    />
                </>
            );
        },
    };
}

function getKindColumn(): ColDef<TComponentDataType> {
    const valueGetter = ({ data }: ValueGetterParams<TComponentDataType>) => {
        return data && AgValue.create(data.kind, data, ['dirty']);
    };
    return {
        colId: 'kind',
        headerName: 'Kind',
        filter: EColumnFilterType.text,
        enableRowGroup: true,
        equals: AgValue.isEqual,
        valueGetter,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) =>
            isNil(params.value) ? null : (
                <KindWithCellRenderer kind={params.value.payload} dirty={params.value.data.dirty} />
            ),
    };
}

function getNameColumn(): ColDef<TComponentDataType> {
    return {
        colId: 'name',
        field: 'name',
        headerName: 'Name',
        enableRowGroup: true,
        filter: EColumnFilterType.text,
        flex: 1,
        suppressSizeToFit: true,
        suppressAutoSize: true,
        sort: 'asc',
        comparator: lowerCaseComparator,
    };
}

export function getNameColumnWithTooltip(): ColDef<TServer> {
    return {
        ...getNameColumn(),
        tooltipField: 'name',
        tooltipComponent: DefaultTooltip,
        sort: 'asc',
        comparator: lowerCaseComparator,
    } as ColDef<TServer>;
}

export function getVersionColumn(): ColDef<TServer> {
    return {
        colId: 'version',
        field: 'version',
        headerName: 'Version',
        enableRowGroup: true,
        filter: EColumnFilterType.set,
        flex: 1,
        suppressSizeToFit: true,
        suppressAutoSize: true,
        tooltipField: 'version',
        tooltipComponent: DefaultTooltip,
    };
}

export function useMenuColumns(timeZone: TimeZone): ColDef<TComponentDataType>[] {
    return useMemo(
        (): ColDef<TComponentDataType>[] => [
            getStatusColumn(timeZone) as ColDef<TComponentDataType>,
            getKindColumn(),
            getNameColumn(),
        ],
        [timeZone],
    );
}
