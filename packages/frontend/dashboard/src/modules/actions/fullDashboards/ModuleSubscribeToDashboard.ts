import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { scanValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEqual, isNil, mapValues } from 'lodash-es';
import type { Observable, UnaryFunction } from 'rxjs';

import { SubscribeToDashboardProcedureDescriptor } from '../../../actors/FullDashboards/descriptors';
import type { TFullDashboard } from '../../../types/fullDashboard';
import { getUniqueDashboardItemKey } from '../../../utils/dashboards';

export const ModuleSubscribeToDashboard = createRemoteProcedureCall(
    SubscribeToDashboardProcedureDescriptor,
)({
    getPipe: restoreReferences,
    dedobs: {
        normalize: ([key]) => getUniqueDashboardItemKey(key),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
    retry: {
        needRetry: (err) => {
            if (err instanceof GrpcError) {
                return (
                    err.code !== EGrpcErrorCode.NOT_FOUND &&
                    err.code !== EGrpcErrorCode.UNAUTHENTICATED
                );
            }

            return true;
        },
    },
});

function restoreReferences(): UnaryFunction<
    Observable<TValueDescriptor2<TFullDashboard>>,
    Observable<TValueDescriptor2<TFullDashboard>>
> {
    return scanValueDescriptor(
        (
            previous: undefined | TValueDescriptor2<TFullDashboard>,
            current,
        ): TValueDescriptor2<TFullDashboard> => {
            if (isNil(previous) || isNil(previous.value)) {
                return current;
            }

            const previousDashboard = previous.value.dashboard;
            const currentDashboard = current.value.dashboard;

            if (isEqual(previousDashboard, currentDashboard)) {
                return createSyncedValueDescriptor({
                    ...current.value,
                    dashboard: previousDashboard,
                } as TFullDashboard);
            }

            const previousPanelsMap = new Map(
                previousDashboard.panels.map((panel) => [panel.panelId, panel]),
            );

            return createSyncedValueDescriptor({
                ...current.value,
                dashboard: {
                    ...currentDashboard,
                    panels: currentDashboard.panels.map((currentPanel) => {
                        const previousPanel = previousPanelsMap.get(currentPanel.panelId);

                        return isNil(previousPanel) || !isEqual(currentPanel, previousPanel)
                            ? restoreObjectContentReferences(currentPanel, previousPanel)
                            : previousPanel;
                    }),
                },
            });
        },
    );
}

function restoreObjectContentReferences<T extends object>(current: T, previous: T | undefined): T {
    if (isNil(previous)) {
        return current;
    }

    return mapValues(current, (value, key) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const previousValue = previous[key as keyof T] as any;
        return isEqual(value, previousValue) ? previousValue : value;
    });
}
