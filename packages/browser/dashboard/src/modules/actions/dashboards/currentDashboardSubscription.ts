import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { ModuleUI } from '../../ui/module';
import { ModuleGetDashboardValueDescriptor } from '../fullDashboards/ModuleGetDashboardValueDescriptor';

export function currentDashboardSubscription(
    ctx: TContextRef,
): Observable<TValueDescriptor2<TFullDashboard>> {
    const { currentDashboardItemKey$ } = ModuleUI(ctx);
    const getDashboard$ = ModuleGetDashboardValueDescriptor(ctx);

    return currentDashboardItemKey$.pipe(
        switchMap((dashboardItemKey): Observable<TValueDescriptor2<TFullDashboard>> => {
            return isNil(dashboardItemKey) ? of(WAITING_VD) : getDashboard$(dashboardItemKey);
        }),
        shareReplayWithDelayedReset(SHARE_RESET_DELAY),
    );
}
