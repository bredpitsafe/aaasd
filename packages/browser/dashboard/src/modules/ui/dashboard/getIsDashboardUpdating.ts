import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';
import type { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { dashboardUpdateProgressSetEnvBox } from '../../../actors/FullDashboards/envelope';
import { tapRuntimeError } from '../../utils';

export function getDashboardsUpdateProgress(
    ctx: TContextRef,
): Observable<ReadonlySet<TStorageDashboardId>> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);

    return dashboardUpdateProgressSetEnvBox.requestStream(actor, undefined).pipe(
        tapRuntimeError(error),
        map((updateList) => new Set<TStorageDashboardId>(updateList)),
        shareReplay(1),
    );
}
