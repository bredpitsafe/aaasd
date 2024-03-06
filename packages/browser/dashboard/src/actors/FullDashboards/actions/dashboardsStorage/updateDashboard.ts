import { updateDashboardEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type {
    EStorageDashboardStatus,
    TStorageDashboardConfig,
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { FailFactory } from '@frontend/common/src/types/Fail';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { first, mapTo, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import type { TDashboardActionFailDesc } from '../../types';
import { convertErrorToDashboardActionFailDesc, logError } from './utils';

const createFail = FailFactory('UpdateServerDashboard');
const descFactory = ValueDescriptorFactory<
    true,
    TDashboardActionFailDesc<'UpdateServerDashboard'>
>();

type TUpdateServerDashboardReturnType = ExtractValueDescriptor<typeof descFactory>;

export function updateDashboard(
    ctx: TContextRef,
    traceId: TraceId,
    id: TStorageDashboardId,
    name: TStorageDashboardName,
    config: TStorageDashboardConfig,
    status: EStorageDashboardStatus,
    digest: string,
): Observable<TUpdateServerDashboardReturnType> {
    const actor = ModuleActor(ctx);

    const { currentStage$ } = ModuleServiceStage(ctx);
    return currentStage$.pipe(
        first(),
        switchMap((stage) =>
            updateDashboardEnvBox
                .request(actor, {
                    url: stage.url,
                    id,
                    name,
                    config,
                    status,
                    digest,
                    traceId,
                })
                .pipe(
                    mapTo(descFactory.sync(true, null)),
                    startWith(descFactory.unsc(null)),
                    logError('updateServerDashboard', 'Failed to update dashboard config'),
                    convertErrorToDashboardActionFailDesc(createFail),
                ),
        ),
    );
}
