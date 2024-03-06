import type { TContextRef } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { assertNever } from '@frontend/common/src/utils/assert';
import { switchMapDesc, tapDesc } from '@frontend/common/src/utils/Rx/desc';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import { EMPTY, from, Observable, of } from 'rxjs';
import { finalize, first, mergeMap, switchMap } from 'rxjs/operators';

import { updateDashboardEnvBox } from '../../../actors/FullDashboards/envelope';
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
import { tapRuntimeError } from '../../utils';
import { ModuleDashboardsStorage } from '../fullDashboards';
import { ModuleGetDashboardValueDescriptor } from '../fullDashboards/ModuleGetDashboardValueDescriptor';
import { navigateByDashboardItemKey } from '../navigation/navigateByDashboardItemKey';

export function saveDashboard(
    ctx: TContextRef,
    traceId: TraceId,
    dashboardItemKey: TDashboardItemKey,
): Observable<boolean> {
    const { dashboardList$ } = ModuleDashboardsStorage(ctx);
    const getDashboardValueDescriptor = ModuleGetDashboardValueDescriptor(ctx);

    return getDashboardValueDescriptor(dashboardItemKey).pipe(
        // mergeMapStreamEnvelope({
        //     value: ({ payload }) => of(payload),
        //     fail: () => of(undefined),
        //     meta: () => EMPTY,
        // }),
        first(({ value, fail }) => !isNil(value) || !isNil(fail)),
        mergeMap(({ value: fullDashboard, fail }) => {
            if (!isNil(fail) || isNil(fullDashboard)) {
                return of(false);
            }

            if (
                !isStorageDashboard(fullDashboard) ||
                isReadonlyDashboardsStorageItem(fullDashboard.item)
            ) {
                return dashboardList$.pipe(
                    switchMapDesc({
                        idle: () => EMPTY,
                        unsynchronized: () => EMPTY,
                        synchronized: (list) => of(list),
                        fail: () => of(undefined),
                    }),
                    switchMap((list) => {
                        if (isNil(list)) {
                            return of(false);
                        }

                        return from(makeUniqDashboardName(ctx, fullDashboard, list)).pipe(
                            switchMap((fullDashboard) =>
                                isNil(fullDashboard)
                                    ? of(false)
                                    : updateDashboard(ctx, traceId, fullDashboard, true),
                            ),
                        );
                    }),
                );
            }

            return updateDashboard(ctx, traceId, fullDashboard);
        }),
    );
}

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

    return new Promise<TFullDashboard | undefined>(async (resolve) => {
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

function updateDashboard(
    ctx: TContextRef,
    traceId: TraceId,
    fullDashboard: TFullDashboard,
    navigateDashboard = false,
): Observable<boolean> {
    const actor = ModuleActor(ctx);

    const { loading, success } = ModuleMessages(ctx);
    const { error } = ModuleNotifications(ctx);

    const closeLoading = loading(`Saving Dashboard...`);

    return updateDashboardEnvBox.requestStream(actor, { traceId, fullDashboard }).pipe(
        tapRuntimeError(error),
        tapDesc({
            synchronized: (dashboardItemKey) => {
                void success('Dashboard Saved');

                if (navigateDashboard) {
                    void navigateByDashboardItemKey(ctx, dashboardItemKey);
                }
            },
            fail: ({ code, meta }) => {
                switch (code) {
                    case '[UpdateDashboard]: UPDATE_IN_PROGRESS':
                        error({ message: 'Another update is in progress' });
                        break;
                    case '[UpdateDashboard]: AUTHORIZATION':
                    case '[UpdateDashboard]: NOT_FOUND':
                    case '[UpdateDashboard]: SERVER_NOT_PROCESSED':
                        error({
                            message: 'Failed to save Dashboard',
                            description: meta.message,
                            traceId: meta.traceId,
                        });
                        break;
                    case '[UpdateDashboard]: UNKNOWN':
                        error({
                            message: 'UI Error',
                            description: meta,
                        });
                        break;
                    default:
                        assertNever(code);
                }
            },
        }),
        switchMapDesc({
            idle: () => EMPTY,
            unsynchronized: () => EMPTY,
            synchronized: () => of(true),
            fail: () => of(false),
        }),
        finalize(closeLoading),
    );
}
