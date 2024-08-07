import {
    DashboardChooseMenuProps,
    EDashboardChooseMenuSelectors,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.choose.menu.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { ResizableBox } from '@frontend/common/src/components/Resizable';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleMessages } from '@frontend/common/src/modules/messages';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { cnDisplayNone, cnFit } from '@frontend/common/src/utils/css/common.css';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedFunction } from '@frontend/common/src/utils/React/useNotifiedFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import {
    switchMapValueDescriptor,
    tapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { Space } from 'antd';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { Ref } from 'react';
import type React from 'react';
import { forwardRef } from 'react';
import { lazily } from 'react-lazily';
import type { ResizeCallbackData } from 'react-resizable';
import { useLocalStorage } from 'react-use';
import { map, of } from 'rxjs';

import { Dialog } from '../../components/Layout/components/Dialog';
import { ModuleCreateDashboard } from '../../modules/actions/dashboards/createDashboard';
import { ModuleDeleteDashboard } from '../../modules/actions/dashboards/deleteDashboard';
import { ModuleRenameDashboard } from '../../modules/actions/dashboards/renameDashboard';
import { ModuleResetDashboardDraft } from '../../modules/actions/dashboards/resetDashboardDraft';
import { ModuleUpdateDashboardBinding } from '../../modules/actions/dashboards/updateDashboardBinding';
import { ModuleGetDashboardList } from '../../modules/actions/fullDashboards/getDashboardList';
import { ModuleCloneDashboard } from '../../modules/actions/modals/cloneDashboard';
import { ModuleOpenModalChangePermissions } from '../../modules/actions/modals/openModalChangePermissions';
import { ModuleSaveDashboard } from '../../modules/actions/modals/saveDashboard';
import {
    ModuleGetRouteParamsForURLByDashboardItemKey,
    ModuleNavigateByDashboardItemKey,
} from '../../modules/actions/navigation/navigateByDashboardItemKey';
import { ModuleDashboardRouter } from '../../modules/router/module';
import { ModuleUI } from '../../modules/ui/module';
import type { TDashboardItem, TStorageDashboardItem } from '../../types/fullDashboard';
import {
    areDashboardItemKeysEqual,
    createEmptyDashboard,
    getDashboardItemKeyFromItem,
} from '../../utils/dashboards';
import {
    convertDashboardToExportableDashboardEditor,
    convertDashboardToXml,
} from '../../utils/dashboards/converters';
import { DashboardScopeInfo } from './components/DashboardScopeInfo/DashboardScopeInfo.tsx';
import { ScopedDashboardsFilter } from './components/ScopedDashboardsFilter/ScopedDashboardsFilter';
import { cnAddAndChooseDashboard, cnModalHeader } from './styles.css';
import { useGetDashboardsListFilters } from './useGetDashboardsListFilters';
import { cnResizeHandle } from './WidgetDialogDashboardList.css';

const { TableDashboardList } = lazily(
    () => import('../../components/Tables/TableDashboardList/view'),
);

export const WidgetDialogDashboardList = forwardRef(
    (
        props: TWithClassname & { visible: boolean; onHide?: () => void },
        ref: Ref<HTMLDivElement>,
    ) => {
        const traceId = useTraceId();
        const { buildUrl } = useModule(ModuleDashboardRouter);
        const { currentDashboardItemKey$, getDashboardsUpdateProgress } = useModule(ModuleUI);
        const { success } = useModule(ModuleMessages);
        const saveDashboard = useModule(ModuleSaveDashboard);
        const updateDashboardScopeBinding = useModule(ModuleUpdateDashboardBinding);
        const resetDashboardDraft = useModule(ModuleResetDashboardDraft);
        const deleteDashboard = useModule(ModuleDeleteDashboard);
        const renameDashboard = useModule(ModuleRenameDashboard);
        const createDashboard = useModule(ModuleCreateDashboard);
        const getDashboardList = useModule(ModuleGetDashboardList);
        const cloneDashboard = useModule(ModuleCloneDashboard);
        const openModalChangePermissions = useModule(ModuleOpenModalChangePermissions);
        const navigateByDashboardItemKey = useModule(ModuleNavigateByDashboardItemKey);
        const getRouteParamsForURLByDashboardItemKey = useModule(
            ModuleGetRouteParamsForURLByDashboardItemKey,
        );

        const {
            isScopedDashboardsRoute,
            currentScope,
            dashboardsListFiltersParams,
            showBoundDashboardsOnly,
            handleScopeFilterChanged,
        } = useGetDashboardsListFilters();

        const listDescriptor = useValueDescriptorObservable(
            getDashboardList(dashboardsListFiltersParams, { traceId }),
        );

        const updatingStorageDashboardIds = useValueDescriptorObservable(
            getDashboardsUpdateProgress(undefined, { traceId }),
        );
        const currentDashboardItemKey = useSyncObservable(currentDashboardItemKey$);

        const [addDashboard] = useNotifiedObservableFunction(
            () => {
                const dashboard = createEmptyDashboard('New Dashboard' as TStorageDashboardName);

                return createDashboard(
                    {
                        name: dashboard.name,
                        config: convertDashboardToXml(
                            convertDashboardToExportableDashboardEditor(dashboard),
                        ),
                    },
                    { traceId },
                ).pipe(
                    switchMapValueDescriptor((valueDescriptor) => {
                        const { value: storageKey } = valueDescriptor;

                        return isScopedDashboardsRoute
                            ? updateDashboardScopeBinding(
                                  {
                                      dashboardId: storageKey.storageId,
                                      scope: currentScope ?? {},
                                      action: 'bind',
                                  },
                                  {
                                      traceId,
                                  },
                              ).pipe(map(() => valueDescriptor))
                            : of(valueDescriptor);
                    }),
                    switchMapValueDescriptor(({ value: key }) => {
                        return navigateByDashboardItemKey({ key }, { traceId });
                    }),
                );
            },
            {
                getNotifyTitle: () => ({ loading: 'Adding dashboard', success: 'Dashboard added' }),
            },
        );

        const [bindDashboardToCurrentScope] = useNotifiedObservableFunction(
            (dashboardItem: TStorageDashboardItem) => {
                return updateDashboardScopeBinding(
                    {
                        dashboardId: dashboardItem.item.id,
                        scope: currentScope ?? {},
                        action: 'bind',
                    },
                    {
                        traceId,
                    },
                );
            },
            {
                getNotifyTitle: () => ({
                    loading: 'Binding Dashboard',
                    success: 'Dashboard is bound',
                }),
            },
        );

        const [unbindDashboardFromCurrentScope] = useNotifiedObservableFunction(
            (dashboardItem: TStorageDashboardItem) => {
                return updateDashboardScopeBinding(
                    {
                        dashboardId: dashboardItem.item.id,
                        scope: currentScope ?? {},
                        action: 'unbind',
                    },
                    {
                        traceId,
                    },
                );
            },
            {
                getNotifyTitle: () => ({
                    loading: 'Unbinding Dashboard',
                    success: 'Dashboard is unbound',
                }),
            },
        );

        const [cbDeleteDashboard] = useNotifiedObservableFunction(
            (dashboardItem: TDashboardItem) => {
                const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
                return deleteDashboard(dashboardItemKey, { traceId }).pipe(
                    tapValueDescriptor(() => {
                        if (
                            !isNil(currentDashboardItemKey) &&
                            areDashboardItemKeysEqual(currentDashboardItemKey, dashboardItemKey)
                        ) {
                            navigateByDashboardItemKey({ key: undefined }, { traceId });
                        }
                    }),
                );
            },
            {
                getNotifyTitle: () => ({
                    loading: 'Deleting Dashboard',
                    success: 'Dashboard deleted',
                }),
            },
        );
        const [cbSaveDashboard] = useNotifiedObservableFunction(
            (dashboardItem: TDashboardItem) => {
                const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
                return saveDashboard(dashboardItemKey, { traceId });
            },
            {
                getNotifyTitle: () => ({ loading: 'Saving Dashboard', success: 'Dashboard saved' }),
            },
        );
        const [cbRevertDashboard] = useNotifiedObservableFunction(
            (dashboardItem: TDashboardItem) => {
                const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
                return resetDashboardDraft(dashboardItemKey, { traceId });
            },
            {
                getNotifyTitle: () => ({ loading: 'Revert changes', success: 'Changes reverted' }),
            },
        );
        const cbCreateRouteParams = useNotifiedFunction((dashboardItem: TDashboardItem) => {
            const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
            return getRouteParamsForURLByDashboardItemKey(dashboardItemKey, { traceId });
        });
        const [cbRenameDashboard] = useNotifiedObservableFunction(
            (dashboardItem: TDashboardItem, name: TStorageDashboardName) => {
                return renameDashboard(
                    {
                        name,
                        dashboardItemKey: getDashboardItemKeyFromItem(dashboardItem),
                    },
                    { traceId },
                );
            },
            {
                getNotifyTitle: () => ({
                    loading: 'Renaming dashboard',
                    success: 'Dashboard renamed',
                }),
            },
        );
        const [cbCloneDashboard] = useNotifiedObservableFunction(
            (dashboardItem: TDashboardItem) => {
                const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
                return cloneDashboard(dashboardItemKey, { traceId });
            },
        );

        const [cbShareDashboard] = useNotifiedObservableFunction(
            (dashboardItem: TDashboardItem) => {
                const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
                return openModalChangePermissions(dashboardItemKey, { traceId });
            },
        );

        const cbCopyDashboardURL = useFunction(async (dashboardItem: TDashboardItem) => {
            const routeParams = await cbCreateRouteParams(dashboardItem);
            const url = buildUrl(routeParams.route, routeParams.params);
            await clipboardWrite(url);
            success('Dashboard URL copied to clipboard');
        });

        const [size, setSize] = useLocalStorage<{ width: number }>(
            'ResizableBox:' + ETableIds.DashboardsList,
        );
        const handleResizeStop = useFunction(
            (e: React.SyntheticEvent, data: ResizeCallbackData) => {
                setSize(data.size);
            },
        );

        return (
            <ResizableBox
                {...DashboardChooseMenuProps[EDashboardChooseMenuSelectors.DashboardChooseMenuList]}
                className={cn(props.className, !props.visible && cnDisplayNone)}
                axis="x"
                width={size?.width ?? 600}
                handle={<div className={cnResizeHandle} />}
                onResizeStop={handleResizeStop}
            >
                <Dialog
                    className={cnFit}
                    rootRef={ref}
                    title={
                        <div className={cnModalHeader}>
                            <div className={cnAddAndChooseDashboard}>
                                {isScopedDashboardsRoute && showBoundDashboardsOnly
                                    ? `Bound Dashboards`
                                    : 'Dashboards'}
                                <Button
                                    {...DashboardChooseMenuProps[
                                        EDashboardChooseMenuSelectors.AddDashboardButton
                                    ]}
                                    size="small"
                                    onClick={addDashboard}
                                >
                                    Add
                                </Button>
                            </div>
                            {isScopedDashboardsRoute && (
                                <Space size="small">
                                    {!isNil(currentScope) && (
                                        <DashboardScopeInfo scope={currentScope} />
                                    )}
                                    <ScopedDashboardsFilter
                                        showBoundDashboardsOnly={showBoundDashboardsOnly}
                                        onScopeFilterChanged={handleScopeFilterChanged}
                                    />
                                </Space>
                            )}
                        </div>
                    }
                    visible={props.visible}
                    onClose={props.onHide}
                >
                    <Suspense>
                        <TableDashboardList
                            currentDashboardItemKey={currentDashboardItemKey}
                            dashboardsItems={listDescriptor.value}
                            deleteDashboard={cbDeleteDashboard}
                            persistDashboard={cbSaveDashboard}
                            revertDashboard={cbRevertDashboard}
                            updatingStorageDashboardIds={updatingStorageDashboardIds.value}
                            renameDashboard={cbRenameDashboard}
                            cloneDashboard={cbCloneDashboard}
                            shareDashboard={cbShareDashboard}
                            copyDashboardURL={cbCopyDashboardURL}
                            createRouteParams={cbCreateRouteParams}
                            bindDashboardToCurrentScope={bindDashboardToCurrentScope}
                            unbindDashboardFromCurrentScope={unbindDashboardFromCurrentScope}
                            showBoundDashboardsOnly={showBoundDashboardsOnly}
                            onHide={props.onHide}
                        />
                    </Suspense>
                </Dialog>
            </ResizableBox>
        );
    },
);
