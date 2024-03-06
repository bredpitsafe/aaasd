import { lowerCaseComparator } from '@frontend/common/src/components/AgTable/comparators/lowerCaseComparator';
import {
    TextEditor,
    TTextEditorStatus,
} from '@frontend/common/src/components/AgTable/editors/TextEditor';
import { EColumnFilterType, TColDef } from '@frontend/common/src/components/AgTable/types';
import { Link } from '@frontend/common/src/components/Link';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { assertNever } from '@frontend/common/src/utils/assert';
import type { CellClassParams, ICellRendererParams, IRowNode } from 'ag-grid-community';
import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';

import type { TDashboardItem } from '../../../types/fullDashboard';
import {
    isIndicatorsDashboardItem,
    isRobotDashboardItem,
    isStorageDashboardItem,
} from '../../../types/fullDashboard/guards';
import { EDashboardRoutes, TDashboardRouteParams } from '../../../types/router';
import { areDashboardItemKeysEqual, getDashboardItemKeyFromItem } from '../../../utils/dashboards';
import { DashboardIcon } from './components/DashboardIcon';
import { cnDirtyDashboardTitle, cnFullHeightCell, cnIconWrapper, cnLink } from './styles.css';

export const createColumns = (
    createRouteParams: (item: TDashboardItem) => {
        route: EDashboardRoutes;
        params: TDashboardRouteParams;
    },
): TColDef<TDashboardItem>[] => [
    {
        headerName: 'Permission',
        cellRenderer: DashboardIcon,
        width: 38,
        maxWidth: 38,
        cellClass: cnIconWrapper,
        resizable: false,
        comparator: (
            valueA: unknown,
            valueB: unknown,
            nodeA: IRowNode<TDashboardItem>,
            nodeB: IRowNode<TDashboardItem>,
        ) => {
            const dataA = nodeA.data;
            const dataB = nodeB.data;
            if (isNil(dataA) || isNil(dataB)) return 0;
            return convertDashboardItemToType(dataA).localeCompare(
                convertDashboardItemToType(dataB),
            );
        },
    },
    {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        comparator: lowerCaseComparator,
        flex: 1,
        resizable: false,
        suppressAutoSize: true,
        filter: EColumnFilterType.text,
        editable: true,
        // Following line is hack because AgGrid doesn't refresh cell when params.data.hasDraft flag changes
        equals: () => false,
        cellClass: cnFullHeightCell,
        cellEditor: TextEditor,
        cellEditorParams: dashboardNameCellEditorParamsGetter,
        cellRenderer: dashboardNameCellRendererFactory(createRouteParams),
    },
    {
        headerName: 'Type',
        width: 100,
        maxWidth: 100,
        initialHide: true,
        enableRowGroup: true,
        valueGetter: ({ data }) => (isNil(data) ? undefined : convertDashboardItemToType(data)),
    },
];

function convertDashboardItemToType(item: TDashboardItem) {
    if (isRobotDashboardItem(item)) return 'Robot';
    if (isIndicatorsDashboardItem(item)) return 'Indicators';
    if (isStorageDashboardItem(item)) {
        const permission = item.item.permission;
        switch (permission) {
            case EStorageDashboardPermission.Owner:
                return 'Own dashboard';
            case EStorageDashboardPermission.Editor:
                return 'Shared editable dashboard';
            case EStorageDashboardPermission.Viewer:
                return 'Shared readonly dashboard';
            case EStorageDashboardPermission.None:
                return 'Without permission';
            default:
                assertNever(permission);
        }
    }

    return 'Unknown';
}

function dashboardNameCellEditorParamsGetter(params: CellClassParams<TDashboardItem, string>) {
    const rows = (params.context ?? []) as TDashboardItem[];

    if (isNil(params.data)) {
        return undefined;
    }

    const currentItemKey = getDashboardItemKeyFromItem(params.data);

    return {
        validate(
            value: undefined | string,
        ): undefined | { status: TTextEditorStatus; message?: string } {
            if (isEmpty(value)) {
                return { status: 'error', message: `Dashboard name can't be empty` };
            }

            if (isEmpty(rows)) {
                return undefined;
            }

            return rows.some(
                (row) =>
                    row.name === value &&
                    !areDashboardItemKeysEqual(currentItemKey, getDashboardItemKeyFromItem(row)),
            )
                ? { status: 'warning', message: `Dashboard name exists` }
                : undefined;
        },
    };
}

function dashboardNameCellRendererFactory(
    createRouteParams: (item: TDashboardItem) => {
        route: EDashboardRoutes;
        params: TDashboardRouteParams;
    },
) {
    return function ({ data }: ICellRendererParams<TDashboardItem>) {
        if (isNil(data)) {
            return;
        }

        const { route, params } = createRouteParams(data);

        return (
            <Link
                className={cn(cnLink, data.item.hasDraft && cnDirtyDashboardTitle)}
                title={data.item.hasDraft ? 'Dashboard has unsaved changes' : ''}
                routeName={route}
                routeParams={params}
            >
                {data.name}
            </Link>
        );
    };
}
