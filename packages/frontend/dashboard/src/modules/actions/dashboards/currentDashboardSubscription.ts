import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { ModuleUI } from '../../ui/module';
import { ModuleSubscribeToDashboard } from '../fullDashboards/ModuleSubscribeToDashboard.ts';

export const ModuleSubscribeToCurrentDashboard = createObservableProcedure(
    (ctx) => {
        const { currentDashboardItemKey$ } = ModuleUI(ctx);
        const subscribeToDashboard = ModuleSubscribeToDashboard(ctx);

        return (_, options): Observable<TValueDescriptor2<TFullDashboard>> => {
            return currentDashboardItemKey$.pipe(
                switchMap((dashboardItemKey): Observable<TValueDescriptor2<TFullDashboard>> => {
                    return isNil(dashboardItemKey)
                        ? of(WAITING_VD)
                        : subscribeToDashboard(dashboardItemKey, options);
                }),
            );
        };
    },
    {
        dedobs: {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
