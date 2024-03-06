import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { logErrorAndFail } from '@frontend/common/src/utils/Rx/log';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify';
import { scanValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    LOADING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEqual, isNil, mapValues } from 'lodash-es';
import type { Observable, UnaryFunction } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { getDashboardEnvBox } from '../../../actors/FullDashboards/envelope';
import type { TDashboardItemKey, TFullDashboard } from '../../../types/fullDashboard';
import { getUniqueDashboardItemKey } from '../../../utils/dashboards';

export const ModuleGetDashboardValueDescriptor = ModuleFactory(
    (
        ctx: TContextRef,
    ): ((dashboardItem: TDashboardItemKey) => Observable<TValueDescriptor2<TFullDashboard>>) => {
        const actor = ModuleActor(ctx);
        const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);

        return dedobs(
            (dashboardItemKey: TDashboardItemKey) => {
                return getDashboardEnvBox
                    .requestStream(actor, dashboardItemKey)
                    .pipe(
                        logErrorAndFail(),
                        notifyErrorAndFail(),
                        restoreReferences(),
                        startWith(LOADING_VD),
                    );
            },
            {
                removeDelay: DEDUPE_REMOVE_DELAY,
                resetDelay: SHARE_RESET_DELAY,
                normalize: ([key]) => getUniqueDashboardItemKey(key),
            },
        );
    },
);

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
