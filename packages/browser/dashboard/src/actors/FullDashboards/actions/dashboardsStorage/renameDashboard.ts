import { renameDashboardEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type {
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    LOADING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { Observable } from 'rxjs';
import { first, map, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { logError } from './utils';

export function renameDashboard(
    ctx: TContextRef,
    traceId: TraceId,
    id: TStorageDashboardId,
    name: TStorageDashboardName,
): Observable<TValueDescriptor2<true>> {
    const actor = ModuleActor(ctx);
    const { currentStage$ } = ModuleServiceStage(ctx);

    return currentStage$.pipe(
        first(),
        switchMap((stage) =>
            renameDashboardEnvBox
                .request(actor, {
                    url: stage.url,
                    id,
                    name,
                    traceId,
                })
                .pipe(
                    map(() => createSyncedValueDescriptor(true as const)),
                    startWith(LOADING_VD),
                    logError('renameServerDashboard', 'Failed to rename dashboard'),
                ),
        ),
    );
}
