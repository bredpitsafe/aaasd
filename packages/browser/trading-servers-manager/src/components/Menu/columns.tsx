import { lowerCaseComparator } from '@frontend/common/src/components/AgTable/comparators/lowerCaseComparator';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import type { TWithBuildInfo } from '@frontend/common/src/types/domain/buildInfo';
import { TServer } from '@frontend/common/src/types/domain/servers';
import type { ISO, TimeZone } from '@frontend/common/src/types/time';
import type { ColDef } from 'ag-grid-community';
import type { ICellRendererParams } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer';
import { useMemo } from 'react';

import { BuildInfo } from './BuildInfo/view';
import { KindWithCellRenderer } from './Components/KindWithCellRenderer';
import type { TComponentDataType } from './Components/view';
import { ComponentStatus } from './ComponentStatus';

type TStatusColumnData = { status: string; statusMessage: string | null } & TWithBuildInfo & {
        startTime?: ISO;
        dirty?: boolean;
    };
export function getStatusColumn(timeZone: TimeZone): ColDef<TStatusColumnData> {
    return {
        colId: 'status',
        field: 'status',
        headerName: 'Status',
        enableRowGroup: true,
        filter: EColumnFilterType.set,
        width: 60,
        resizable: false,
        flex: 0,
        suppressSizeToFit: true,
        suppressAutoSize: true,
        // Following line is hack because AgGrid doesn't refresh cell when other fields have changed
        // Used fields: statusMessage, buildInfo, startTime
        equals: () => false,
        cellRendererSelector: (params) => {
            return {
                component: () => {
                    return (
                        <>
                            {params.value ? (
                                <ComponentStatus
                                    status={params.value}
                                    statusMessage={params.data?.statusMessage}
                                />
                            ) : null}

                            <BuildInfo
                                buildInfo={params.data?.buildInfo}
                                timeZone={timeZone}
                                startTime={params.data?.startTime}
                            />
                        </>
                    );
                },
            };
        },
    };
}

function getKindColumn(): ColDef<TComponentDataType> {
    return {
        colId: 'kind',
        field: 'kind',
        headerName: 'Kind',
        filter: EColumnFilterType.set,
        enableRowGroup: true,
        // Following line is hack because AgGrid doesn't refresh cell when params.data.dirty flag changes
        equals: () => false,
        cellRenderer: (params: ICellRendererParams<TComponentDataType, string>) => (
            <KindWithCellRenderer kind={params.value!} dirty={params.data?.dirty} />
        ),
    };
}

function getNameColumn(): ColDef<TComponentDataType> {
    return {
        colId: 'name',
        field: 'name',
        headerName: 'Name',
        enableRowGroup: true,
        filter: EColumnFilterType.set,
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
