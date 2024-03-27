import { LoadingOutlined } from '@ant-design/icons';
import {
    CellEditingStoppedEvent,
    GetRowIdParams,
    RowClassParams,
    RowClickedEvent,
} from '@frontend/ag-grid';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useLocalGridState } from '@frontend/common/src/components/AgTable/hooks/useLocalGridState';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { Nil } from '@frontend/common/src/types';
import type {
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import hash from 'hash-sum';
import { isNil, isUndefined } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TDashboardItem, TDashboardItemKey } from '../../../types/fullDashboard';
import { EDashboardRoutes, TDashboardRouteParams } from '../../../types/router';
import { areDashboardItemKeysEqual, getDashboardItemKeyFromItem } from '../../../utils/dashboards';
import { createColumns } from './columns';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { cnActiveListItem, cnLoadingContainer, cnLoadingIcon } from './styles.css';

export const TableDashboardList = memo(
    (props: {
        currentDashboardItemKey: undefined | TDashboardItemKey;
        dashboardsItems: Nil | TDashboardItem[];
        deleteDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
        persistDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
        revertDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
        shareDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
        cloneDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
        copyDashboardURL: (dashboardItem: TDashboardItem) => Promise<void>;
        renameDashboard: (
            dashboardItem: TDashboardItem,
            dashboardName: TStorageDashboardName,
        ) => Promise<unknown>;

        createRouteParams: (key: TDashboardItem) => {
            route: EDashboardRoutes;
            params: TDashboardRouteParams;
        };
        updatingStorageDashboardIds: Nil | TStorageDashboardId[];
        onRowClick?: () => void;
    }) => {
        const {
            currentDashboardItemKey,
            updatingStorageDashboardIds,
            dashboardsItems,
            deleteDashboard,
            persistDashboard,
            revertDashboard,
            renameDashboard,
            cloneDashboard,
            shareDashboard,
            copyDashboardURL,
        } = props;

        const columns = useMemo(
            () => createColumns(props.createRouteParams),
            [props.createRouteParams],
        );

        const rowClassRules = useMemo(() => {
            return {
                [cnActiveListItem]: (params: RowClassParams<TDashboardItem>) => {
                    return (
                        !isNil(params.data) &&
                        !isNil(currentDashboardItemKey) &&
                        areDashboardItemKeysEqual(
                            currentDashboardItemKey,
                            getDashboardItemKeyFromItem(params.data),
                        )
                    );
                },
            };
        }, [currentDashboardItemKey]);

        const getContextMenuItems = useGetContextMenuItems({
            deleteDashboard,
            persistDashboard,
            revertDashboard,
            cloneDashboard,
            shareDashboard,
            copyDashboardURL,
            updatingStorageDashboardIds,
        });

        const handleRenameClick = useFunction((event: CellEditingStoppedEvent<TDashboardItem>) => {
            if (
                !isUndefined(event.data) &&
                !isNil(event.newValue) &&
                event.oldValue !== event.newValue
            ) {
                void renameDashboard(event.data, event.newValue);
            }
        });

        const { gridApi, columnApi, onGridReady } = useGridApi<TDashboardItem>();

        useLocalGridState(ETableIds.DashboardsList, gridApi, columnApi);

        // Selecting dashboard should close the list after the selection,
        // unless Ctrl or Shift keys are pressed upon selection.
        const cbRowClicked = (event: RowClickedEvent) => {
            const pointerEvent = event.event as PointerEvent | undefined;
            if (pointerEvent?.ctrlKey || pointerEvent?.shiftKey) {
                pointerEvent?.preventDefault();
                return;
            }

            props.onRowClick?.();
        };

        if (isNil(dashboardsItems)) {
            return (
                <div className={cnLoadingContainer}>
                    <LoadingOutlined className={cnLoadingIcon} spin />
                </div>
            );
        }

        return (
            <AgTable<TDashboardItem>
                getRowId={getRowId}
                rowData={dashboardsItems}
                rowHeight={30}
                columnDefs={columns}
                getContextMenuItems={getContextMenuItems}
                onCellEditingStopped={handleRenameClick}
                rowClassRules={rowClassRules}
                onGridReady={onGridReady}
                context={dashboardsItems}
                onRowClicked={cbRowClicked}
            />
        );
    },
);

function getRowId({ data }: GetRowIdParams<TDashboardItem>) {
    return hash(getDashboardItemKeyFromItem(data));
}
