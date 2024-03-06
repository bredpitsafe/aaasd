import { updateDashboardDraftEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type {
    TStorageDashboardConfig,
    TStorageDashboardId,
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

const createFail = FailFactory('UpdateServerDashboardDraft');
const descFactory = ValueDescriptorFactory<
    true,
    TDashboardActionFailDesc<'UpdateServerDashboardDraft'>
>();

export type TUpdateServerDashboardDraftReturnType = ExtractValueDescriptor<typeof descFactory>;

export function updateDashboardDraft(
    ctx: TContextRef,
    traceId: TraceId,
    id: TStorageDashboardId,
    config: TStorageDashboardConfig,
): Observable<TUpdateServerDashboardDraftReturnType> {
    const actor = ModuleActor(ctx);

    const { currentStage$ } = ModuleServiceStage(ctx);
    return currentStage$.pipe(
        first(),
        switchMap((stage) =>
            updateDashboardDraftEnvBox
                .request(actor, {
                    url: stage.url,
                    id,
                    config,
                    traceId,
                })
                .pipe(
                    mapTo(descFactory.sync(true, null)),
                    startWith(descFactory.unsc(null)),
                    logError('updateServerDashboardDraft', 'Failed to update dashboard draft'),
                    convertErrorToDashboardActionFailDesc(createFail),
                ),
        ),
    );
}
