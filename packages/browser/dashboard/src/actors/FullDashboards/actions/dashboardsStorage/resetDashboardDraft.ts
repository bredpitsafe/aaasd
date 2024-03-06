import { resetDashboardDraftEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';
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

const createFail = FailFactory('ResetServerDashboardDraft');
const descFactory = ValueDescriptorFactory<
    true,
    TDashboardActionFailDesc<'ResetServerDashboardDraft'>
>();

type TResetServerDashboardReturnType = ExtractValueDescriptor<typeof descFactory>;

export function resetDashboardDraft(
    ctx: TContextRef,
    traceId: TraceId,
    id: TStorageDashboardId,
): Observable<TResetServerDashboardReturnType> {
    const actor = ModuleActor(ctx);

    const { currentStage$ } = ModuleServiceStage(ctx);
    return currentStage$.pipe(
        first(),
        switchMap((stage) =>
            resetDashboardDraftEnvBox
                .request(actor, {
                    url: stage.url,
                    id,
                    traceId,
                })
                .pipe(
                    mapTo(descFactory.sync(true, null)),
                    startWith(descFactory.unsc(null)),
                    logError('resetServerDashboardDraft', 'Failed to reset dashboard draft'),
                    convertErrorToDashboardActionFailDesc(createFail),
                ),
        ),
    );
}
