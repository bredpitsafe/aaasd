import { updateDashboardShareSettingsEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type {
    EStorageDashboardSharePermission,
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

const createFail = FailFactory('UpdateServerDashboardShareSettings');
const descFactory = ValueDescriptorFactory<
    true,
    TDashboardActionFailDesc<'UpdateServerDashboardShareSettings'>
>();

type TUpdateServerDashboardSettingsReturnType = ExtractValueDescriptor<typeof descFactory>;

export function updateDashboardShareSettings(
    ctx: TContextRef,
    traceId: TraceId,
    id: TStorageDashboardId,
    sharePermission: EStorageDashboardSharePermission,
): Observable<TUpdateServerDashboardSettingsReturnType> {
    const actor = ModuleActor(ctx);
    const { currentStage$ } = ModuleServiceStage(ctx);
    return currentStage$.pipe(
        first(),
        switchMap((stage) =>
            updateDashboardShareSettingsEnvBox
                .request(actor, {
                    url: stage.url,
                    id,
                    sharePermission,
                    traceId,
                })
                .pipe(
                    mapTo(descFactory.sync(true, null)),
                    startWith(descFactory.unsc(null)),
                    logError(
                        'updateServerDashboardShareSettings',
                        'Failed to update dashboard share settings',
                    ),
                    convertErrorToDashboardActionFailDesc(createFail),
                ),
        ),
    );
}
