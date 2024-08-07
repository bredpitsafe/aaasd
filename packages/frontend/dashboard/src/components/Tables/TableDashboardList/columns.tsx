import { assertNever } from '@common/utils/src/assert.ts';
import type {
    CellClassParams,
    ICellRendererParams,
    IRowNode,
    ValueGetterParams,
} from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator';
import type { TColDef } from '@frontend/ag-grid/src/types';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import {
    DashboardPageProps,
    EDashboardPageSelectors,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import type { TTextEditorStatus } from '@frontend/common/src/components/AgTable/editors/TextEditor';
import { TextEditor } from '@frontend/common/src/components/AgTable/editors/TextEditor';
import { CheckboxCellRenderer } from '@frontend/common/src/components/CheckboxCellRenderer';
import { Link } from '@frontend/common/src/components/Link';
import type { TScope } from '@frontend/common/src/types/domain/dashboardsStorage';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import cn from 'classnames';
import { isEmpty, isEqual, isNil } from 'lodash-es';

import type { TDashboardItem, TStorageDashboardItem } from '../../../types/fullDashboard';
import {
    isIndicatorsDashboardItem,
    isRobotDashboardItem,
    isStorageDashboardItem,
} from '../../../types/fullDashboard/guards';
import type { EDashboardRoutes, TDashboardRouteParams } from '../../../types/router';
import { areDashboardItemKeysEqual, getDashboardItemKeyFromItem } from '../../../utils/dashboards';
import { DashboardIcon } from './components/DashboardIcon';
import {
    cnDirtyDashboardTitle,
    cnFullHeightCell,
    cnIconWrapper,
    cnLink,
    cnScopeCell,
} from './styles.css';

export const createColumns = (
    createRouteParams: (item: TDashboardItem) => {
        route: EDashboardRoutes;
        params: TDashboardRouteParams;
    },
    currentScope: TScope | undefined,
    showBoundDashboardsOnly: boolean,
    onBoundDashboardCheckboxClick: (newValue: boolean, item: TDashboardItem) => void,
): TColDef<TDashboardItem>[] => [
    {
        colId: 'permission',
        headerName: '',
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
        colId: 'name',
        headerName: 'Name',
        field: 'name',
        cellDataType: 'text',
        sortable: true,
        sort: 'asc',
        sortIndex: 1,
        comparator: lowerCaseComparator,
        flex: 1,
        resizable: false,
        suppressAutoSize: true,
        filter: EColumnFilterType.text,
        editable: true,
        cellClass: cnFullHeightCell,
        cellEditor: TextEditor,
        cellEditorParams: dashboardNameCellEditorParamsGetter,
        equals: AgValue.isEqual,
        valueGetter: createDashboardNameCellValueGetter(createRouteParams),
        cellRenderer: DashboardNameCellRenderer,
    },
    {
        colId: 'type',
        headerName: 'Type',
        width: 100,
        maxWidth: 100,
        initialHide: true,
        enableRowGroup: true,
        valueGetter: ({ data }) => (isNil(data) ? undefined : convertDashboardItemToType(data)),
    },
    ...(currentScope && !showBoundDashboardsOnly
        ? [
              {
                  colId: 'bindingStatus',
                  headerName: 'Bound',
                  sort: 'desc',
                  sortIndex: 0,
                  sortable: true,
                  maxWidth: 80,
                  width: 80,
                  cellClass: cnScopeCell,
                  valueGetter: ({ data }) => {
                      const scopedDashboardItem = data as TStorageDashboardItem;

                      return Boolean(
                          !isNil(scopedDashboardItem) &&
                              scopedDashboardItem.item.scopes.some((scope) =>
                                  isEqual(scope, currentScope),
                              ),
                      );
                  },
                  cellRendererSelector: (params) => {
                      const dashboard = params.data as TStorageDashboardItem;
                      return {
                          params: {
                              onClick: () => {
                                  onBoundDashboardCheckboxClick(params.value, dashboard);
                              },
                              disabled:
                                  dashboard.item.permission === EStorageDashboardPermission.Viewer,
                          },
                          component: CheckboxCellRenderer,
                      };
                  },
              } as TColDef<TDashboardItem>,
          ]
        : []),
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
        valueGetter: (value: ReturnType<ReturnType<typeof createDashboardNameCellValueGetter>>) =>
            value?.payload,
    };
}

const createDashboardNameCellValueGetter =
    (
        createRouteParams: (item: TDashboardItem) => {
            route: EDashboardRoutes;
            params: TDashboardRouteParams;
        },
    ) =>
    ({ data }: ValueGetterParams<TDashboardItem>) => {
        return (
            data &&
            AgValue.create(data.name, {
                itemHasDraft: data.item.hasDraft,

                ...createRouteParams(data),
            })
        );
    };

function DashboardNameCellRenderer(
    params: ICellRendererParams<ReturnType<ReturnType<typeof createDashboardNameCellValueGetter>>>,
) {
    if (isNil(params.value)) {
        return;
    }

    const name = params.value.payload;
    const data = params.value.data;

    return (
        <Link
            {...DashboardPageProps[EDashboardPageSelectors.DashboardsLink]}
            className={cn(cnLink, data.itemHasDraft && cnDirtyDashboardTitle)}
            title={data.itemHasDraft ? 'Dashboard has unsaved changes' : ''}
            routeName={data.route}
            routeParams={data.params}
        >
            {name}
        </Link>
    );
}
