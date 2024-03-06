import { Button } from '@frontend/common/src/components/Button';
import { ResizableBox } from '@frontend/common/src/components/Resizable';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleMessages } from '@frontend/common/src/modules/messages';
import { TWithClassname } from '@frontend/common/src/types/components';
import { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { cnDisplayNone, cnFit } from '@frontend/common/src/utils/css/common.css';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import React, { forwardRef, Ref, useMemo } from 'react';
import { lazily } from 'react-lazily';
import { ResizeCallbackData } from 'react-resizable';
import { useLocalStorage } from 'react-use';
import { firstValueFrom } from 'rxjs';

import { TSubscribeDashboardListReturnType } from '../../actors/FullDashboards/effects/dashboardsListEffect';
import { Dialog } from '../../components/Layout/components/Dialog';
import { ModuleDashboardActions } from '../../modules/actions';
import { ModuleDashboardsStorage } from '../../modules/actions/fullDashboards';
import { ModuleDashboardRouter } from '../../modules/router/module';
import { ModuleUI } from '../../modules/ui/module';
import { TDashboardItem } from '../../types/fullDashboard';
import { EDashboardRoutes } from '../../types/router';
import {
    areDashboardItemKeysEqual,
    createEmptyDashboard,
    getDashboardItemKeyFromItem,
} from '../../utils/dashboards';
import { cnResizeHandle } from './WidgetDialogDashboardList.css';

const { TableDashboardList } = lazily(
    () => import('../../components/Tables/TableDashboardList/view'),
);

export const WidgetDialogDashboardList = forwardRef(
    (
        props: TWithClassname & { visible: boolean; onHide?: () => void },
        ref: Ref<HTMLDivElement>,
    ) => {
        const { navigate, buildUrl } = useModule(ModuleDashboardRouter);
        const { dashboardList$ } = useModule(ModuleDashboardsStorage);
        const { currentDashboardItemKey$, dashboardsUpdatingSet$ } = useModule(ModuleUI);
        const {
            getRouteParamsForURLByDashboardItemKey,
            navigateByDashboardItemKey,
            createDashboard,
            deleteDashboard,
            saveDashboard,
            resetDashboardDraft,
            renameDashboard,
            cloneDashboard,
            openModalChangePermissions,
        } = useModule(ModuleDashboardActions);
        const { success } = useModule(ModuleMessages);

        const listDescriptor = useSyncObservable(
            dashboardList$,
            useMemo(() => UnscDesc(null) as TSubscribeDashboardListReturnType, []),
        );
        const currentDashboardItemKey = useSyncObservable(currentDashboardItemKey$);
        const dashboardsUpdatingSet = useSyncObservable(dashboardsUpdatingSet$);

        const addDashboard = useFunction(async () => {
            const dashboard = createEmptyDashboard('New Dashboard' as TStorageDashboardName);
            const itemKey = await firstValueFrom(createDashboard(generateTraceId(), dashboard));
            await navigateByDashboardItemKey(itemKey);
        });
        const cbDeleteDashboard = useFunction(async (dashboardItem: TDashboardItem) => {
            const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
            await firstValueFrom(deleteDashboard(generateTraceId(), dashboardItemKey));

            if (
                !isNil(currentDashboardItemKey) &&
                areDashboardItemKeysEqual(currentDashboardItemKey, dashboardItemKey)
            ) {
                void navigate(EDashboardRoutes.Default, {});
            }
        });
        const cbSaveDashboard = useFunction(async (dashboardItem: TDashboardItem) => {
            const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
            await firstValueFrom(saveDashboard(generateTraceId(), dashboardItemKey));
        });
        const cbRevertDashboard = useFunction(async (dashboardItem: TDashboardItem) => {
            const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
            await firstValueFrom(resetDashboardDraft(generateTraceId(), dashboardItemKey));
        });
        const cbCreateRouteParams = useFunction((dashboardItem: TDashboardItem) => {
            const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
            return getRouteParamsForURLByDashboardItemKey(dashboardItemKey);
        });
        const cbRenameDashboard = useFunction(
            async (dashboardItem: TDashboardItem, name: TStorageDashboardName) => {
                const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
                await firstValueFrom(renameDashboard(dashboardItemKey, name, generateTraceId()));
            },
        );
        const cbCloneDashboard = useFunction(async (dashboardItem: TDashboardItem) => {
            const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
            await cloneDashboard(dashboardItemKey, generateTraceId());
        });

        const cbShareDashboard = useFunction(async (dashboardItem: TDashboardItem) => {
            const dashboardItemKey = getDashboardItemKeyFromItem(dashboardItem);
            await openModalChangePermissions(dashboardItemKey, generateTraceId());
        });

        const cbCopyDashboardURL = useFunction(async (dashboardItem: TDashboardItem) => {
            const routeParams = cbCreateRouteParams(dashboardItem);
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
                        <>
                            Choose dashboard&nbsp;&nbsp;
                            <Button size="small" onClick={addDashboard}>
                                Add
                            </Button>
                        </>
                    }
                    visible={props.visible}
                    onClose={props.onHide}
                >
                    <Suspense>
                        <TableDashboardList
                            currentDashboardItemKey={currentDashboardItemKey}
                            dashboardsItems={
                                isSyncDesc(listDescriptor) ? listDescriptor.value : undefined
                            }
                            deleteDashboard={cbDeleteDashboard}
                            persistDashboard={cbSaveDashboard}
                            revertDashboard={cbRevertDashboard}
                            dashboardsUpdatingSet={dashboardsUpdatingSet}
                            renameDashboard={cbRenameDashboard}
                            cloneDashboard={cbCloneDashboard}
                            shareDashboard={cbShareDashboard}
                            copyDashboardURL={cbCopyDashboardURL}
                            createRouteParams={cbCreateRouteParams}
                            onRowClick={props.onHide}
                        />
                    </Suspense>
                </Dialog>
            </ResizableBox>
        );
    },
);
