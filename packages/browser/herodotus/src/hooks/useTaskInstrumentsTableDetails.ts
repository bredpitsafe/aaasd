import type { TAgTableProps } from '@frontend/common/src/components/AgTable/AgTable';
import {
    createDetailCellRendererContext,
    DetailCellRenderer,
} from '@frontend/common/src/components/AgTable/DetailCellRenderer';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { ColDef, GetDetailRowDataParams } from 'ag-grid-community';
import { GridOptions } from 'ag-grid-community/dist/lib/entities/gridOptions';
import { useMemo } from 'react';

import {
    getBestAskPriceColumn,
    getBestBidPriceColumn,
    getBestPriceColumn,
    getInstrumentAggressionColumn,
    getInstrumentAveragePriceColumn,
    getInstrumentAveragePriceUsdColumn,
    getInstrumentFilledAmountColumn,
    getInstrumentNameColumn,
    getInstrumentOrderPriceColumn,
    getInstrumentRoleColumn,
    getInstrumentTargetPriceColumn,
    getInstrumentTypeColumn,
    getInstrumentVolumeColumn,
    getStatusMessageColumn,
} from '../components/TableHerodotusTaskInstruments/columns';
import { THerodotusTaskInstrumentView, THerodotusTaskView } from '../types';

type TTaskInstrumentsTableDetailsProps = {
    id: ETableIds;
    type: 'active' | 'archived';
    socketName: TSocketName;
    onCellEditRequest: GridOptions<THerodotusTaskInstrumentView>['onCellEditRequest'];
    onDashboardLinkClick: (url: string, name: string) => void;
};

export function useTaskInstrumentsTableDetails({
    id,
    type,
    socketName,
    onCellEditRequest,
    onDashboardLinkClick,
}: TTaskInstrumentsTableDetailsProps): Pick<
    TAgTableProps<THerodotusTaskInstrumentView>,
    'masterDetail' | 'embedFullWidthRows' | 'detailRowHeight' | 'detailCellRendererParams'
> {
    const activeColumns: ColDef<THerodotusTaskInstrumentView>[] = useMemo(
        () => [
            getInstrumentTypeColumn(),
            getInstrumentRoleColumn(true),
            getInstrumentNameColumn(),
            getInstrumentFilledAmountColumn(),
            getBestBidPriceColumn(socketName, onDashboardLinkClick),
            getBestAskPriceColumn(socketName, onDashboardLinkClick),
            getBestPriceColumn(socketName, onDashboardLinkClick),
            getInstrumentTargetPriceColumn(),
            getInstrumentOrderPriceColumn(),
            getInstrumentAveragePriceColumn(),
            getInstrumentAveragePriceUsdColumn(),
            getInstrumentVolumeColumn(),
            getInstrumentAggressionColumn(true),
            getStatusMessageColumn(),
        ],
        [onDashboardLinkClick, socketName],
    );

    const archivedColumns: ColDef<THerodotusTaskInstrumentView>[] = useMemo(
        () => [
            getInstrumentTypeColumn(),
            getInstrumentRoleColumn(false),
            getInstrumentNameColumn(),
            getInstrumentFilledAmountColumn(),
            getInstrumentOrderPriceColumn(),
            getInstrumentAveragePriceColumn(),
            getInstrumentAveragePriceUsdColumn(),
            getInstrumentVolumeColumn(),
            getInstrumentAggressionColumn(),
            getStatusMessageColumn(),
        ],
        [],
    );

    return useMemo(
        () => ({
            masterDetail: true,
            embedFullWidthRows: true,
            detailRowHeight: 200,
            detailCellRenderer: DetailCellRenderer,
            detailCellRendererParams: {
                refreshStrategy: 'rows',
                detailGridOptions: <GridOptions<THerodotusTaskInstrumentView>>{
                    rowSelection: 'single',
                    columnDefs: type === 'archived' ? archivedColumns : activeColumns,
                    defaultColDef: {
                        sortable: false,
                    },
                    getRowId: (params) => params.data.key,
                    readOnlyEdit: true,
                    onCellEditRequest,
                },
                getDetailRowData(params: GetDetailRowDataParams<THerodotusTaskView>) {
                    params.successCallback([
                        ...(params.data.buyInstruments ?? EMPTY_ARRAY),
                        ...(params.data.sellInstruments ?? EMPTY_ARRAY),
                    ]);
                },
                suppressColumnVirtualisation: true,
                suppressRowVirtualisation: true,
                context: createDetailCellRendererContext(id),
                stopEditingWhenCellsLoseFocus: true,
            },
        }),
        [activeColumns, archivedColumns, onCellEditRequest, id, type],
    );
}
