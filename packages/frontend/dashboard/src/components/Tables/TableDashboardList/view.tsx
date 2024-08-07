import { LoadingOutlined } from '@ant-design/icons';
import type { Nil } from '@common/types';
import { assert } from '@common/utils';
import type {
    CellClickedEvent,
    CellEditingStoppedEvent,
    GetRowIdParams,
    RowClassParams,
} from '@frontend/ag-grid';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useLocalGridState } from '@frontend/common/src/components/AgTable/hooks/useLocalGridState';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type {
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import hash from 'hash-sum';
import { isNil, isUndefined } from 'lodash-es';
import { memo, useMemo } from 'react';

import { useScopedDashboardsState } from '../../../modules/router/hooks/useScopedDashboardsRoute';
import type {
    TDashboardItem,
    TDashboardItemKey,
    TStorageDashboardItem,
} from '../../../types/fullDashboard';
import { isStorageDashboardItem } from '../../../types/fullDashboard/guards.ts';
import type { EDashboardRoutes, TDashboardRouteParams } from '../../../types/router';
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
        bindDashboardToCurrentScope: (dashboardItem: TStorageDashboardItem) => Promise<unknown>;
        unbindDashboardFromCurrentScope: (dashboardItem: TStorageDashboardItem) => Promise<unknown>;
        showBoundDashboardsOnly: boolean;
        createRouteParams: (key: TDashboardItem) => {
            route: EDashboardRoutes;
            params: TDashboardRouteParams;
        };
        updatingStorageDashboardIds: Nil | TStorageDashboardId[];
        onHide?: () => void;
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
            bindDashboardToCurrentScope,
            unbindDashboardFromCurrentScope,
            copyDashboardURL,
            showBoundDashboardsOnly,
        } = props;
        const { gridApi, columnApi, onGridReady } = useGridApi<TDashboardItem>();
        const { isScopedDashboardsRoute, currentScope } = useScopedDashboardsState();

        const handleBoundCheckboxClick = useFunction(
            (bound: boolean, dashboardItem: TDashboardItem) => {
                assert(
                    isStorageDashboardItem(dashboardItem),
                    'dashboard cannot be bound to scope since it`s not a stored dashboard',
                );

                return bound
                    ? unbindDashboardFromCurrentScope(dashboardItem)
                    : bindDashboardToCurrentScope(dashboardItem);
            },
        );

        const columns = useMemo(
            () => [
                ...createColumns(
                    props.createRouteParams,
                    currentScope,
                    showBoundDashboardsOnly,
                    handleBoundCheckboxClick,
                ),
            ],
            [
                props.createRouteParams,
                currentScope,
                showBoundDashboardsOnly,
                handleBoundCheckboxClick,
            ],
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
            bindDashboardToCurrentScope,
            unbindDashboardFromCurrentScope,
            updatingStorageDashboardIds,
            isScopedDashboardsRoute,
            currentScope,
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

        useLocalGridState(ETableIds.DashboardsList, gridApi, columnApi);

        // Selecting dashboard should close the list after the selection,
        // unless Ctrl or Shift keys are pressed upon selection.
        const cbCellClicked = (event: CellClickedEvent) => {
            const pointerEvent = event.event as PointerEvent | undefined;
            if (pointerEvent?.ctrlKey || pointerEvent?.shiftKey) {
                pointerEvent?.preventDefault();
                return;
            }

            if (event.colDef.colId === 'name') {
                props.onHide?.();
            }
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
                onCellClicked={cbCellClicked}
            />
        );
    },
);

function getRowId({ data }: GetRowIdParams<TDashboardItem>) {
    return hash(getDashboardItemKeyFromItem(data));
}
