import type { TContextRef } from '@frontend/common/src/di';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import {
    mergeMapValueDescriptor,
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
    tapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { updateDashboardProcedureDescriptor } from '../../../actors/FullDashboards/descriptors.ts';
import type {
    TDashboardItem,
    TDashboardItemKey,
    TFullDashboard,
} from '../../../types/fullDashboard';
import { isStorageDashboard, isStorageDashboardItem } from '../../../types/fullDashboard/guards';
import {
    areDashboardItemKeysEqual,
    getDashboardItemKeyFromDashboard,
    getDashboardItemKeyFromItem,
    isReadonlyDashboardsStorageItem,
} from '../../../utils/dashboards';
import { ModuleGetDashboardList } from '../fullDashboards/getDashboardList';
import { ModuleSubscribeToDashboard } from '../fullDashboards/ModuleSubscribeToDashboard.ts';
import { ModuleNavigateByDashboardItemKey } from '../navigation/navigateByDashboardItemKey';

const ModuleUpdateDashboard = createRemoteProcedureCall(updateDashboardProcedureDescriptor)();

export const ModuleSaveDashboard = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const getDashboardList = ModuleGetDashboardList(ctx);
    const subscribeToDashboard = ModuleSubscribeToDashboard(ctx);
    const navigateByDashboardItemKey = ModuleNavigateByDashboardItemKey(ctx);

    return (dashboardItemKey: TDashboardItemKey, options) => {
        return subscribeToDashboard(dashboardItemKey, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            mergeMapValueDescriptor(({ value: fullDashboard }) => {
                if (
                    !isStorageDashboard(fullDashboard) ||
                    isReadonlyDashboardsStorageItem(fullDashboard.item)
                ) {
                    return getDashboardList(undefined, options).pipe(
                        takeWhileFirstSyncValueDescriptor(),
                        switchMapValueDescriptor(({ value: list }) => {
                            if (isNil(list)) {
                                return of(createSyncedValueDescriptor(undefined));
                            }

                            return from(makeUniqDashboardName(ctx, fullDashboard, list)).pipe(
                                switchMap((fullDashboard) =>
                                    isNil(fullDashboard)
                                        ? of(createSyncedValueDescriptor(undefined))
                                        : updateDashboard(fullDashboard, options).pipe(
                                              tapValueDescriptor(({ value }) => {
                                                  navigateByDashboardItemKey(
                                                      { key: value },
                                                      options,
                                                  );
                                              }),
                                          ),
                                ),
                            );
                        }),
                    );
                }

                return updateDashboard(fullDashboard, options);
            }),
        );
    };
});

async function makeUniqDashboardName(
    ctx: TContextRef,
    fullDashboard: TFullDashboard,
    dashboardItems: TDashboardItem[],
): Promise<TFullDashboard | undefined> {
    const { show } = ModuleModals(ctx);

    const currentName = fullDashboard.dashboard.name as TStorageDashboardName;
    const currentDashboardItemKey = getDashboardItemKeyFromDashboard(fullDashboard);
    const occupiedNames = dashboardItems
        .filter(
            (dashboardItem) =>
                isStorageDashboardItem(dashboardItem) &&
                (isReadonlyDashboardsStorageItem(dashboardItem.item) ||
                    !areDashboardItemKeysEqual(
                        getDashboardItemKeyFromItem(dashboardItem),
                        currentDashboardItemKey,
                    )),
        )
        .map(({ name }) => name);

    if (occupiedNames.every((name) => name !== currentName)) {
        return fullDashboard;
    }

    const { RenameDashboard } = await import('../../../components/modals/RenameDashboard');

    return new Promise<TFullDashboard | undefined>((resolve) => {
        const modal = show(
            <RenameDashboard
                currentName={fullDashboard.dashboard.name as TStorageDashboardName}
                occupiedNames={occupiedNames}
                onSet={cbSet}
                onCancel={cbCancel}
            />,
        );

        function cbSet(name: TStorageDashboardName) {
            modal.destroy();
            resolve({
                ...fullDashboard,
                dashboard: {
                    ...fullDashboard.dashboard,
                    name,
                },
            });
        }

        function cbCancel() {
            modal.destroy();
            resolve(undefined);
        }
    });
}
